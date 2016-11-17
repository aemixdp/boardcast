const moment = require('moment-timezone');

module.exports = {
    postCount: (document) => document.querySelectorAll('.post').length,
    lastPostTime: (document) => {
        moment.locale('en');
        return moment.tz(
            [...document.querySelector('.post:last-child label').childNodes]
                .filter(n => n.nodeType == 3).map(n => n.textContent).join('').trim(),
            'DD MMMM YYYY (ddd) HH:mm',
            'Europe/Moscow'
        ).toJSON();
    }
};