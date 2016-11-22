const random_ua = require('random-ua');
const crypto = require('crypto');
const mime = require('mime');
const fs = require('fs');
const jsdom = require('jsdom');
const glob = require('glob');
const Url = require('url');
const Phantom = require('phantom');
const Express = require('express');
const BodyParser = require('body-parser');
const Multer = require('multer');
const FlatFile = require('flat-file-db');

const exec = require('child_process').exec;
const guard = require('async-middleware').wrap;

const BoardName = {
    list: [
        '2ch', '0chan',
        'iichan', 'dobrochan',
        'kropyvach'
    ],
    fromUrl: (url) => ({
        '2ch.hk': '2ch',
        '2ch.pm': '2ch',
        '2ch.re': '2ch',
        '0chan.eu': '0chan',
        'iichan.hk': 'iichan',
        '410chan.org': 'iichan',
        'dobrochan.com': 'dobrochan',
        'kropyva.ch': 'kropyvach',
        'www.kropyva.ch': 'kropyvach'
    })[
        Url.parse(url).hostname
    ]
};

const integrations = { common: require('./integrations/common-backend.js') };
BoardName.list.forEach(name =>
    integrations[name] = require(`./integrations/${name}-backend.js`)
);

const stats = {};
BoardName.list.forEach(name =>
    stats[name] = require(`./integrations/${name}-stats.js`)
);

const upload = Multer({
    storage: Multer.diskStorage({
        destination: './temp',
        filename: (req, file, cb) =>
            crypto.pseudoRandomBytes(16, (err, raw) =>
                cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype)))
    })
});

const db = FlatFile('boardcast.db');
const app = Express();

const nop = () => {};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const forever = async (thunk) => {
    for (;;) try {
        await thunk();
    } catch (err) {
        console.error(err);
    }
}

const jsdomEnvAsync = (url) => new Promise((resolve, reject) =>
    jsdom.env({ url,
        features: {
            FetchExternalResources: false,
            ProcessExternalResources: false
        },
        done: (err, window) => {
            if (err) reject(err);
            else resolve(window);
        }
    })
);

const updateStats = async () => {
    for (let group in db.get('groups') || [])
        for (let url of db.get(group) || []) {
            console.log('Updating stats for ' + url);
            let window = await jsdomEnvAsync(url);
            let boardStats = stats[BoardName.fromUrl(url)];
            db.put('post_count_' + url, boardStats.postCount(window.document));
            db.put('last_post_time_' + url, boardStats.lastPostTime(window.document));
            window.close();
            await sleep(20000);
        }
};

let phantom = null;
let pageByUrl = {};
let captchaByUrl = {};

app.use(Express.static('public'));
app.use(BodyParser.json());

app.get('/groups', (req, res) => {
    res.status(200).json(db.get('groups') || {});
});

app.get('/groups/:name', (req, res) => {
    res.status(200).json(
        (db.get(req.params.name) || []).map((url) => ({
            url,
            postCount: db.get('post_count_' + url) || '?',
            lastPostTime: db.get('last_post_time_' + url) || '?'
        }))
    );
});

app.post('/groups/:name', (req, res) => {
    let groups = db.get('groups') || {};
    groups[req.params.name] = true;
    db.put('groups', groups);
    db.put(req.params.name, req.body);
    res.status(200).end();
});

app.delete('/groups/:name', (req, res) => {
    let groups = db.get('groups') || {};
    delete groups[req.params.name];
    db.put('groups', groups);
    db.del(req.params.name);
    res.status(200).end();
});

app.post('/submit', upload.array('files'), guard(async (req, res) => {
    for (var url in pageByUrl) {
        await pageByUrl[url].close();
        let captcha = captchaByUrl[url];
        if (captcha) fs.unlink(`./public/${captcha}`, nop);
    }
    pageByUrl = {};
    captchaByUrl = {};
    let threads = JSON.parse(req.body.threads);
    for (let url of threads) {
        let page = await phantom.createPage();
        await page.setting('userAgent', random_ua.generate());
        if (await page.open(url) == 'fail') continue;
        await page.injectJs('./integrations/es6-promise.auto.min.js');
        await page.injectJs('./integrations/common-frontend.js');
        await page.injectJs(`./integrations/${BoardName.fromUrl(url)}-frontend.js`);
        await integrations.common.setPageMessage(page, req.body.message);
        await integrations[BoardName.fromUrl(url)].uploadFiles(page, req.files.map(f => f.path));
        pageByUrl[url] = page;
        captchaByUrl[url] = await integrations.common.getPageCaptcha(page);
    }
    res.status('200').json(captchaByUrl);
}));

app.get('/captcha', guard(async (req, res) => {
    let page = pageByUrl[req.query.url];
    if (!page) return res.status(404).send('Page not found!');
    await integrations.common.refreshPageCaptcha(page);
    let captcha = await integrations.common.getPageCaptcha(page);
    let oldCaptcha = captchaByUrl[req.query.url];
    if (oldCaptcha) fs.unlink(`./public/${oldCaptcha}`, nop);
    captchaByUrl[url] = captcha;
    res.status(200).send(captcha);
}));

app.post('/captcha', guard(async (req, res) => {
    let url = req.body.url;
    let page = pageByUrl[url];
    if (!page) return res.status(404).send('Page not found!');
    await integrations.common.setPageCaptcha(page, req.body.captcha);
    await integrations[BoardName.fromUrl(req.body.url)].submitPage(page);
    await page.close();
    delete pageByUrl[url];
    let captcha = captchaByUrl[url];
    if (captcha) fs.unlink(`./public/${captcha}`, nop);
    delete captchaByUrl[url];
    res.status(200).send();
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

glob('./public/*.!(html|css|js)', (err, files) => files.forEach(f => fs.unlink(f, nop)));
glob('./temp/*', (err, files) => files.forEach(f => fs.unlink(f, nop)));

db.on('open', () => {
    forever(updateStats);
    Phantom.create(['--ignore-ssl-errors=yes', '--disk-cache=true']).then(async instance => {
        phantom = instance;
        app.listen(3000);
    });
});