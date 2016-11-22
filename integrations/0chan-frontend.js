window.Boardcast = window.Boardcast || {};

var $CAPTCHA = '.captchaimage';
var $CAPTCHA_STATUS = '.captcha_status';
var $CAPTCHA_INPUT = 'input[name="captcha"]';
var $MESSAGE = 'textarea[name="message"]';
var $SUBMIT = 'input[type="submit"]';
var $DISCLAIMER = '#disclaimer';

(function () {
    Boardcast.querySelector($DISCLAIMER).then(function (disclaimerElem) {
        disclaimerElem.style.display = 'none';
    });
})();

Boardcast.getCaptcha = function () {
    return Promise.all([
        Boardcast.querySelector($CAPTCHA),
        Boardcast.querySelector($CAPTCHA_STATUS),
        Boardcast.querySelector($CAPTCHA_INPUT)
    ]).then(function (elems) {
        var captchaImageElem = elems[0];
        var captchaStatusElem = elems[1];
        var captchaInputElem = elems[2];
        return new Promise(function (resolve) {
            var captchaAlive = !captchaStatusElem.innerHTML.trim();
            if (captchaImageElem.src && captchaImageElem.complete && captchaAlive) {
                resolve(captchaImageElem);
            } else {
                var onLoad = function () {
                    captchaImageElem.removeEventListener('load', onLoad);
                    resolve(captchaImageElem);
                };
                captchaImageElem.addEventListener('load', onLoad);
                captchaInputElem.click();
            }
        });
    });
};

Boardcast.refreshCaptcha = function () {
    return Boardcast.getCaptcha().then(function (captchaImageElem) {
        return new Promise(function (resolve) {
            var observer = new MutationObserver(function () {
                observer.disconnect();
                resolve(Boardcast.getCaptcha());
            });
            observer.observe(captchaImageElem, { attributes: true });
            captchaImageElem.click();
        });
    });
};

Boardcast.setMessage = function (message) {
    return Boardcast.querySelector($MESSAGE).then(function (messageElem) {
        messageElem.value = message;
    });
};

Boardcast.setCaptcha = function (captcha) {
    return Boardcast.querySelector($CAPTCHA_INPUT).then(function (captchaInputElem) {
        captchaInputElem.value = captcha;
    });
};

Boardcast.submit = function (callback) {
    return Boardcast.querySelector($SUBMIT).then(function (submitElem) {
        submitElem.click();
    });
};