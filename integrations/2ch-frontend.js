window.Boardcast = window.Boardcast || {};

var $CAPTCHA = '.captcha-image > img';
var $CAPTCHA_CONTAINER = '.captcha-image';
var $CAPTCHA_INPUT = '#captcha-value';
var $IMAGES_AREA = '#postform .images-area';
var $MESSAGE = 'textarea[name="comment"]';
var $REPLY = '#TopNormalReplyLabel';
var $SUBMIT = '#submit';
var $STATUS = '#ABU-alert';
var $STATUS_CONTAINER = '#ABU-alertbox';

(function () {
    document.querySelector($IMAGES_AREA).style.display = 'none';
})();

Boardcast.ensureControlsVisible = function (callback) {
    var img = document.querySelector($CAPTCHA);
    if (img) {
        callback();
    } else {
        document.querySelector($REPLY).click();
        var handle = setInterval(function () {
            var img = document.querySelector($CAPTCHA);
            if (img) {
                clearInterval(handle);
                if (img.complete) {
                    callback();
                } else {
                    var onLoad = function () {
                        img.removeEventListener('load', onLoad);
                        callback();
                    };
                    img.addEventListener('load', onLoad);
                }
            }
        }, Boardcast.CAPTCHA_POLL_INTERVAL);
    }
};

Boardcast.getCaptcha = function (callback) {
    Boardcast.ensureControlsVisible(function () {
        callback(document.querySelector($CAPTCHA));
    });
};

Boardcast.refreshCaptcha = function (callback) {
    Boardcast.ensureControlsVisible(function () {
        var observer = new MutationObserver(function () {
            observer.disconnect();
            Boardcast.ensureControlsVisible(callback);
        });
        observer.observe(document.querySelector($CAPTCHA_CONTAINER), { childList: true });
        document.querySelector($CAPTCHA).click();
    });
};

Boardcast.setMessage = function (msg, callback) {
    Boardcast.ensureControlsVisible(function () {
        document.querySelector($MESSAGE).value = msg;
        callback();
    });
};

Boardcast.setCaptcha = function (captcha, callback) {
    Boardcast.ensureControlsVisible(function () {
        document.querySelector($CAPTCHA_INPUT).value = captcha;
        callback();
    });
};

Boardcast.submit = function (callback) {
    Boardcast.ensureControlsVisible(function () {
        var observer = new MutationObserver(function () {
            observer.disconnect();
            var alertText = document.querySelector($STATUS).innerText.trim();
            if (alertText.indexOf('успешно') != -1) {
                callback();
            } else if (alertText.indexOf('Капча невалидна') != -1) {
                callback(Boardcast.error('WrongCaptchaError', alertText));
            } else {
                callback(Boardcast.error('SubmitError'));
            }
        });
        observer.observe(document.querySelector($STATUS_CONTAINER), { childList: true });
        document.querySelector($SUBMIT).click();
    });
};
