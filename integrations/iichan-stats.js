const moment = require('moment-timezone');

module.exports = {
    postCount: (document) => document.querySelectorAll('form > div > table').length + 1,
    lastPostTime: (document) => {
        moment.locale('ru');
        return moment.tz(
            [...document.querySelector('form > div > table:last-child label').childNodes]
                .filter(n => n.nodeType == 3).map(n => n.textContent).join('').trim(),
            'ddd DD MMMM YYYY HH:mm:ss',
            'Europe/Moscow'
        ).toJSON();
    }
};