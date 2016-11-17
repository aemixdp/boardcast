const common = require('./common-backend');

module.exports = {
    uploadFiles: common.concatImagesUploader('input[type="file"]'),

    submitPage: (page) => new Promise((resolve, reject) => {
        page.on('onLoadFinished', async () => {
            let url = await page.property('url');
            if (url.indexOf('0chan.eu/board.php') == -1)
                resolve();
            else
                reject(new common.WrongCaptchaError());
        });
        common.submitPage(page).catch(reject);
    })
};