window.Boardcast = window.Boardcast || {};

var $CAPTCHA = '#captcha-image';
var $CAPTCHA_INPUT = 'input[name="captcha"]';
var $MESSAGE = 'textarea';
var $SUBMIT = 'input[type="submit"]';

Boardcast.ensureCaptchaVisible = function (callback) {
    var img = document.querySelector($CAPTCHA);
    document.body.insertBefore(img, document.body.firstChild);
    if (img.complete) {
        callback();
    } else {
        var onLoad = function () {
            img.removeEventListener('load', onLoad);
            callback();
        };
        img.addEventListener('load', onLoad);
    }
};

Boardcast.getCaptcha = function (callback) {
    Boardcast.ensureCaptchaVisible(function () {
        callback(document.querySelector($CAPTCHA));
    });
};

Boardcast.refreshCaptcha = function (callback) {
    Boardcast.ensureCaptchaVisible(function () {
        var img = document.querySelector($CAPTCHA);
        var observer = new MutationObserver(function () {
            observer.disconnect();
            Boardcast.ensureCaptchaVisible(callback);
        });
        observer.observe(img, { attributes: true });
        img.click();
    });
};

Boardcast.setMessage = function (msg, callback) {
    document.querySelector($MESSAGE).value = msg;
    callback();
};

Boardcast.setCaptcha = function (captcha, callback) {
    document.querySelector($CAPTCHA_INPUT).value = captcha;
    callback();
};

Boardcast.submit = function (callback) {
    document.querySelector($SUBMIT).click();
    callback();
};