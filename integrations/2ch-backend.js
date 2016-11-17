const common = require('./common-backend');

module.exports = {
    uploadFiles: (page, files) =>
        page.uploadFile('#formimages', files),

    submitPage: common.submitPage
};