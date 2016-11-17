const moment = require('moment-timezone');

module.exports = {
    postCount: (document) => document.querySelectorAll('.postnode').length,
    lastPostTime: (document) => {
        moment.locale('ru');
        return moment.tz(
            [...document.querySelector('.postnode:last-child label').childNodes]
                .filter(n => n.nodeType == 3).map(n => n.textContent).join('').trim(),
            'ddd YYYY MMM DD HH:mm:ss',
            'Europe/Moscow'
        ).toJSON();
    }
};