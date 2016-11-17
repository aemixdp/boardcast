window.Boardcast = window.Boardcast || {};

var $MESSAGE = '#body';
var $SUBMIT = 'input[type="submit"]';
var $LAST_FILE = '#upload_file4';
var $ADD_FILE = '.add_image';

(function () {
    var addFile = document.querySelector($ADD_FILE);
    addFile.click();
    addFile.click();
    addFile.click();
})();

Boardcast.getCaptcha = function (callback) {
    callback();
};

Boardcast.refreshCaptcha = function (callback) {
    callback();
};

Boardcast.setMessage = function (msg, callback) {
    document.querySelector($MESSAGE).value = msg;
    callback();
};

Boardcast.setCaptcha = function (captcha, callback) {
    callback();
};

Boardcast.submit = function (callback) {
    document.querySelector($SUBMIT).click();
    callback();
};