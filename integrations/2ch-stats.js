const moment = require('moment-timezone');

module.exports = {
    postCount: (document) => document.querySelectorAll('.post-wrapper').length,
    lastPostTime: (document) => {
        moment.locale('ru');
        return moment.tz(
            document.querySelector('.post-wrapper:last-child .posttime')
                .textContent.replace('Суб', 'Сбт'),
            'DD/MM/YY ddd HH:mm:ss',
            'Europe/Moscow'
        ).toJSON();
    }
};