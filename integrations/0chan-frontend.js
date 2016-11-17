window.Boardcast = window.Boardcast || {};

var $CAPTCHA = '.captchaimage';
var $CAPTCHA_STATUS = '.captcha_status';
var $CAPTCHA_INPUT = 'input[name="captcha"]';
var $MESSAGE = 'textarea[name="message"]';
var $SUBMIT = 'input[type="submit"]';

Boardcast.ensureCaptchaVisible = function (callback) {
    document.getElementById('disclaimer').style.display = 'none';
    var img = document.querySelector($CAPTCHA);
    var captchaAlive = !document.querySelector($CAPTCHA_STATUS).innerHTML.trim();
    if (img.src && img.complete && captchaAlive) {
        callback();
    } else {
        var onLoad = function () {
            img.removeEventListener('load', onLoad);
            callback();
        };
        img.addEventListener('load', onLoad);
        document.querySelector($CAPTCHA_INPUT).click();
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
