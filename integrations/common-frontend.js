window.Boardcast = window.Boardcast || {};

Boardcast.CAPTCHA_POLL_INTERVAL = 100;

Boardcast.imgToBase64 = function (img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    return canvas.toDataURL('image/png');
};

Boardcast.placement = function (elem) {
    var docElem, win,
        box = { top: 0, left: 0 },
        doc = elem && elem.ownerDocument;
    docElem = doc.documentElement;
    if ( typeof elem.getBoundingClientRect !== typeof undefined ) {
        box = elem.getBoundingClientRect();
    }
    win = (doc != null && doc === doc.window)
        ? doc
        : doc.nodeType === 9 && doc.defaultView;
    return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft,
        width: elem.clientWidth,
        height: elem.clientHeight
    };
};

Boardcast.querySelector = function (selector) {
    return new Promise(function (resolve, reject) {
        var elem = document.querySelector(selector);
        if (elem) resolve(elem);
        else reject(Boardcast.error('PageError',
            'Element matching "' + selector +'" not found!'));
    });
};

Boardcast.querySelectorFn = function (selector) {
    return function () {
        return Boardcast.querySelector(selector);
    };
};

Boardcast.error = function (type, msg) {
    return { type: type, message: msg };
};
