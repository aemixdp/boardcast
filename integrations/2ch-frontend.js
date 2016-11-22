window.Boardcast = window.Boardcast || {};

var $CAPTCHA = '.captcha-image > img';
var $CAPTCHA_INPUT = '#captcha-value';
var $IMAGES_AREA = '#postform .images-area';
var $MESSAGE = 'textarea[name="comment"]';
var $REPLY = '#TopNormalReplyLabel';
var $SUBMIT = '#submit';
var $STATUS = '#ABU-alert';
var $STATUS_CONTAINER = '#ABU-alertbox';

(function () {
    Boardcast.querySelector($IMAGES_AREA).then(function (imagesAreaElem) {
        imagesAreaElem.style.display = 'none';
    });
})();

Boardcast.ensureControlsVisible = function () {
    return new Promise(function (resolve, reject) {
        var img = document.querySelector($CAPTCHA);
        if (img) {
            resolve();
        } else {
            Boardcast.querySelector($REPLY)
                .catch(reject)
                .then(function (replyElem) {
                    replyElem.click();
                    var handle = setInterval(function () {
                        var img = document.querySelector($CAPTCHA);
                        if (img) {
                            clearInterval(handle);
                            if (img.complete) {
                                resolve();
                            } else {
                                var onLoad = function () {
                                    img.removeEventListener('load', onLoad);
                                    resolve();
                                };
                                img.addEventListener('load', onLoad);
                            }
                        }
                    }, Boardcast.CAPTCHA_POLL_INTERVAL);
                });
        }
    });
};

Boardcast.getCaptcha = function () {
    return Boardcast.ensureControlsVisible()
        .then(Boardcast.querySelectorFn($CAPTCHA));
};

Boardcast.refreshCaptcha = function () {
    return Boardcast.getCaptcha().then(function (captchaImageElem) {
        return new Promise(function (resolve) {
            var observer = new MutationObserver(function () {
                observer.disconnect();
                resolve(Boardcast.getCaptcha());
            });
            observer.observe(captchaImageElem.parentNode, { childList: true });
            captchaImageElem.click();
        });
    });
};

Boardcast.setMessage = function (message) {
    return Boardcast.ensureControlsVisible()
        .then(Boardcast.querySelectorFn($MESSAGE))
        .then(function (messageElem) {
            messageElem.value = message;
        });
};

Boardcast.setCaptcha = function (captcha) {
    return Boardcast.ensureControlsVisible()
        .then(Boardcast.querySelectorFn($CAPTCHA_INPUT))
        .then(function (captchaInputElem) {
            captchaInputElem.value = captcha;
        });
};

Boardcast.submit = function () {
    return Boardcast.ensureControlsVisible()
        .then(function () {
            return Promise.all([
                Boardcast.querySelector($STATUS_CONTAINER),
                Boardcast.querySelector($SUBMIT)
            ]);
        }).then(function (elems) {
            var statusContainerElem = elems[0];
            var submitElem = elems[1];
            return new Promise(function (resolve, reject) {
                var observer = new MutationObserver(function () {
                    observer.disconnect();
                    Boardcast.querySelector($STATUS)
                        .catch(reject)
                        .then(function (statusElem) {
                            var alertText = statusElem.innerText.trim();
                            if (alertText.indexOf('успешно') != -1) {
                                resolve();
                            } else if (alertText.indexOf('Капча невалидна') != -1) {
                                reject(Boardcast.error('WrongCaptchaError', alertText));
                            } else {
                                reject(Boardcast.error('SubmitError'));
                            }
                        });
                });
                observer.observe(statusContainerElem, { childList: true });
                submitElem.click();
            });
        });
};