const common = require('./common-backend');

module.exports = {
    uploadFiles: common.concatImagesUploader('input[type="file"]', 'jpeg'),

    submitPage: (page) => new Promise((resolve, reject) => {
        page.on('onLoadFinished', resolve);
        common.submitPage(page).catch(reject);
    })
};