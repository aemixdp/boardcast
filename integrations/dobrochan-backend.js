const common = require('./common-backend');

module.exports = {
    uploadFiles: async (page, files) => {
        for (var i in files)
            await page.uploadFile(`#file_${+i + 1}`, files[i]);
    },

    submitPage: (page) => new Promise((resolve, reject) => {
        let urlChanged = false;
        let url = '';
        page.on('onUrlChanged', (newUrl) => {
            urlChanged = true;
            url = newUrl;
        });
        page.on('onLoadFinished', async () => {
            if (!urlChanged) return;
            if (url.indexOf('dobrochan.com/error') == -1)
                resolve();
            else {
                let error = (await page.evaluate(function () {
                    return document.querySelector('.post-error').innerText;
                })).trim().toLowerCase();
                if (error.indexOf('неверная капча') != -1) {
                    reject(new common.WrongCaptchaError(error));
                } else {
                    reject(new common.SubmitError(error));
                }
            }
        });
        common.submitPage(page).catch(reject);
    })
};