const common = require('./common-backend');

module.exports = {
    uploadFiles: async (page, files) => {
        for (var i in files)
            await page.uploadFile(`#upload_file${i == 0 ? '' : +i + 1}`, files[i]);
    },

    submitPage: (page) => new Promise((resolve, reject) => {
        page.on('onLoadFinished', async () => {
            let url = await page.property('url');
            if (url.indexOf('kropyva.ch/post') == -1)
                resolve();
            else
                reject(new common.SubmitError());
        });
        common.submitPage(page).catch(reject);
    })
};