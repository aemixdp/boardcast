const path = require('path');
const exec = require('child_process').exec;
const commandExists = require('command-exists');
const ExtendableError = require('es6-error');

class PageError extends ExtendableError {}
class WrongCaptchaError extends ExtendableError {}
class SubmitError extends ExtendableError {}

const evaluateWithPromise = (() => {
    const POLL_INTERVAL = 100;
    const VAR_PREFIX = 'Boardcast$';
    let varCounter = 0;
    return (page, fn) => {
        varCounter++;
        return new Promise((resolve, reject) => {
            const varName = VAR_PREFIX + varCounter;
            page.evaluateJavaScript(`function () {
                var resolve = function (data) {
                    window['${varName}_resolved'] = true;
                    window['${varName}'] = data;
                };
                var reject = function (data) {
                    window['${varName}_rejected'] = true;
                    window['${varName}'] = data;
                };
                (${fn})(resolve, reject);
            }`);
            let handle = setInterval(async () => {
                let resolved = await page.evaluateJavaScript(`function () { return window['${varName}_resolved']; }`);
                let rejected = await page.evaluateJavaScript(`function () { return window['${varName}_rejected']; }`);
                let data = await page.evaluateJavaScript(`function () { return window['${varName}']; }`);
                if (resolved) {
                    clearInterval(handle);
                    resolve(data);
                } else if (rejected) {
                    clearInterval(handle);
                    reject(new (eval(data.type))(data.message));
                }
            }, POLL_INTERVAL);
        });
    };
})();

module.exports = {
    PageError,
    WrongCaptchaError,
    SubmitError,

    getPageCaptcha: async (page) => {
        let placement = await evaluateWithPromise(page, `function (resolve, reject) {
            Boardcast.getCaptcha().catch(reject).then(function (captchaImageElem) {
                resolve(captchaImageElem && Boardcast.placement(captchaImageElem));
            });
        }`);
        if (placement) {
            await page.property('clipRect', placement);
            let timestamp = Date.now();
            await page.render(`public/${timestamp}.png`);
            return `${timestamp}.png`;
        } else {
            return null;
        }
    },

    refreshPageCaptcha: (page) => evaluateWithPromise(page, `function (resolve, reject) {
        Boardcast.refreshCaptcha().catch(reject).then(resolve);
    }`),

    setPageMessage: (page, msg) => evaluateWithPromise(page, `function (resolve, reject) {
        Boardcast.setMessage(${JSON.stringify(msg)}).catch(reject).then(resolve);
    }`),

    setPageCaptcha: (page, captcha) => evaluateWithPromise(page, `function (resolve, reject) {
        Boardcast.setCaptcha('${captcha}').catch(reject).then(resolve);
    }`),

    submitPage: (page) => evaluateWithPromise(page, `function (resolve, reject) {
        Boardcast.submit().catch(reject).then(resolve);
    }`),

    concatImagesUploader: (selector, ext = 'png') => (page, files) => new Promise((resolve, reject) => {
        if (files.length == 0) return resolve();
        commandExists('montage', (err, exists) => {
            if (exists) {
                let catFileName = files.map(f => path.parse(f).name).toString().replace(/,/g, '').slice(0, 250);
                let catFilePath = path.format({ dir: path.parse(files[0]).dir, base: catFileName });
                exec(`montage ${files.toString().replace(/,/g, ' ')} -tile x1 -geometry +0+0 ${catFilePath}.${ext}`, (err) => {
                    if (err) reject(err);
                    else page.uploadFile(selector, `${catFilePath}.${ext}`).then(resolve).catch(reject);
                });
            } else {
                page.uploadFile(selector, files[0]).then(resolve).catch(reject);
            }
        });
    })
};