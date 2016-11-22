const common = require('./common-backend');

module.exports = {
    uploadFiles: common.concatImagesUploader('input[type="file"]', 'jpeg'),

    submitPage: (page) => new Promise((resolve, reject) => {
        page.on('onLoadFinished', async () => {
            let url = await page.property('url');
            if (url.indexOf('iichan.hk/cgi-bin/wakaba.pl') != -1)
                reject(new common.SubmitError(
                    await page.evaluate(function () {
                        return document.querySelector('p').textContent.trim();
                    })
                ));
            else
                resolve();
        });
        common.submitPage(page).catch(reject);
    })
};