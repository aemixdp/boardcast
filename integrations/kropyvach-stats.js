module.exports = {
    postCount: (document) => document.querySelectorAll('.post').length,
    lastPostTime: (document) => document.querySelector('.post:last-of-type time').getAttribute('datetime')
};