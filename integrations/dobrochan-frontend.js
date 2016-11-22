window.Boardcast = window.Boardcast || {};

var $CAPTCHA = '#captcha-image';
var $CAPTCHA_INPUT = 'input[name="captcha"]';
var $MESSAGE = 'textarea';
var $SUBMIT = 'input[type="submit"]';

(function () {
    Boardcast.querySelector($CAPTCHA).then(function (captchaImageElem) {
        document.body.insertBefore(captchaImageElem, document.body.firstChild);
    });
})();

Boardcast.getCaptcha = function () {
    return Boardcast.querySelector($CAPTCHA).then(function (captchaImageElem) {
        return new Promise(function (resolve) {
            if (captchaImageElem.complete) {
                resolve(captchaImageElem);
            } else {
                var onLoad = function () {
                    captchaImageElem.removeEventListener('load', onLoad);
                    resolve(captchaImageElem);
                };
                captchaImageElem.addEventListener('load', onLoad);
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

Boardcast.submit = function () {
    return Boardcast.querySelector($SUBMIT).then(function (submitElem) {
        submitElem.click();
    });
};