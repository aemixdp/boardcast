window.Boardcast = window.Boardcast || {};

var $MESSAGE = '#body';
var $SUBMIT = 'input[type="submit"]';
var $LAST_FILE = '#upload_file4';
var $ADD_FILE = '.add_image';

Boardcast.querySelector($ADD_FILE).then(function (addFileElem) {
    addFileElem.click();
    addFileElem.click();
    addFileElem.click();
});

Boardcast.getCaptcha = function () {
    return Promise.resolve();
};

Boardcast.refreshCaptcha = function () {
    return Promise.resolve();
};

Boardcast.setMessage = function (message) {
    return Boardcast.querySelector($MESSAGE).then(function (messageElem) {
        messageElem.value = message;
    });
};

Boardcast.setCaptcha = function (captcha) {
    return Promise.resolve();
};

Boardcast.submit = function () {
    return Boardcast.querySelector($SUBMIT).then(function (submitElem) {
        submitElem.click();
    });
};