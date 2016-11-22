window.Boardcast = window.Boardcast || {};

var $CAPTCHA = '#captcha, #faptchaimage';
var $CAPTCHA_INPUT = 'input[name="captcha"], #faptcha_input';
var $MESSAGE = 'textarea';
var $SUBMIT = 'input[type="submit"]';

Boardcast.getCaptcha = function () {
    return Boardcast.querySelector($CAPTCHA).then(function (img) {
        return new Promise(function (resolve) {
            document.body.insertBefore(img, document.body.firstChild);
            if (img.complete) {
                resolve(img);
            } else {
                var onLoad = function () {
                    img.removeEventListener('load', onLoad);
                    resolve(img);
                };
                img.addEventListener('load', onLoad);
            }
        });
    });
};

Boardcast.refreshCaptcha = function () {
    return Boardcast.getCaptcha().then(function (img) {
        return new Promise(function (resolve) {
            var observer = new MutationObserver(function () {
                observer.disconnect();
                resolve(Boardcast.getCaptcha());
            });
            observer.observe(img, { attributes: true });
            img.click();
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