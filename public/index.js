var THREAD_TEMPLATE = $('#thread-template').html();

var $groups = $('#groups');
var $groupName = $('#group-name');
var $threads = $('#threads');
var $threadUrl = $('#thread-url');
var $postMessage = $('#post-message');
var $file = $('input[type="file"]');
var $fileControls = $('#file-controls');
var $postingInputs = $('input:not(#group-name), textarea, button');
var $submit = $('#submit');

var currentGroup;
var groups = {};
var threadElemByUrl = {};
var files = [null, null, null, null];
var clickedImage;
var draggedImage;

function createGroup () {
    var name = $groupName.val().toUpperCase();
    if (groups[name]) return $groupName.val('');
    if (name == '') return;
    addGroup(name);
    $groupName.val('');
    $.ajax({
        type: 'POST',
        url: '/groups/' + name,
        contentType: 'application/json',
        data: '[]'
    });
}

function addGroup (name) {
    groups[name] = [];
    $groups
        .append($('<a href="#" id="' + name + '" onclick="selectGroup(\'' + name + '\')">' + name + '</a>'))
        .append($('<a href="#" onclick="removeGroup(\'' + name + '\')">✖</a>'));
}

function removeGroup (name) {
    if (!confirm('Are you sure?')) return;
    groups[name] = null;
    $('#' + name + ' + *').remove();
    $('#' + name).remove();
    if (name == currentGroup) {
        $postingInputs.prop('disabled', true);
        $threads.empty();
    }
    $.ajax({
        type: 'DELETE',
        url: '/groups/' + name
    });
}

function selectGroup (name) {
    $.get('/groups/' + name, function (threads) {
        $threads.empty();
        threadElemByUrl = {};
        threads.forEach(addThread);
        currentGroup = name;
        $postingInputs.prop('disabled', false);
        $postMessage.val('');
        $fileControls.find('input').val('');
        $fileControls.find('img').prop('src', '');
    });
}

function createThread () {
    var url = $threadUrl.val().trim();
    if (url == '') return;
    if (url.indexOf('http') != 0) url = 'http://' + url;
    if (threadElemByUrl[url]) return $threadUrl.val('');
    addThread({ url: url, postCount: '?', lastPostTime: '?' });
    $threadUrl.val('');
    $.ajax({
        type: 'POST',
        url: '/groups/' + currentGroup,
        contentType: 'application/json',
        data: JSON.stringify(Object.keys(threadElemByUrl))
    });
}

function addThread (thread) {
    var threadElem = $(
        THREAD_TEMPLATE
            .replace(/{{url}}/g, thread.url)
            .replace(/{{postCount}}/g, thread.postCount)
            .replace(/{{lastPostTime}}/g,
                thread.lastPostTime == '?' ? '?'
                    : new Date(thread.lastPostTime).toLocaleString('ru'))
    );
    $threads.append(threadElem);
    threadElemByUrl[thread.url] = threadElem;
}

function removeThread (url) {
    threadElemByUrl[url].remove();
    delete threadElemByUrl[url];
    $.ajax({
        type: 'POST',
        url: '/groups/' + currentGroup,
        contentType: 'application/json',
        data: JSON.stringify(Object.keys(threadElemByUrl))
    });
}

function toggleThreadActive (url) {
    threadElemByUrl[url].toggleClass('active');
}

function selectFile () {
    $file.val('');
    $file.trigger('click');
}

function fileSelected () {
    var file = $file[0].files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
        clickedImage.attr('src', e.target.result);
        files[clickedImage.data('index')] = file;
    };
    reader.readAsDataURL(file);
}

function submit () {
    var threads = [];
    for (var url in threadElemByUrl) {
        var $elem = threadElemByUrl[url];
        if ($elem.find('input[type="checkbox"]').prop('checked')) {
            threads.push(url);
        } else {
            $elem.find('input, button').prop('disabled', true);
        }
    }
    $postingInputs.prop('disabled', true);
    $submit.prop('disabled', false);
    var formData = new FormData();
    formData.append('threads', JSON.stringify(threads));
    formData.append('message', $postMessage.val());
    files.forEach(function (file) {
        if (file) formData.append('files', file);
    });
    $.ajax({
        type: 'POST',
        url: '/submit',
        data: formData,
        processData: false,
        contentType: false
    }).done(function (captchaByUrl) {
        for (var url in captchaByUrl) {
            var $thread = threadElemByUrl[url];
            $thread.find('.captcha-input-controls')
                .find('input, button')
                .prop('disabled', false);
            var captcha = captchaByUrl[url];
            if (captcha) {
                $thread.find('.captcha-image').prop('src', captcha);
            } else {
                $thread.find('.captcha').prop('disabled', true);
            }
        }
    });
}

function submitCaptcha (url) {
    var $thread = threadElemByUrl[url];
    var captcha = $thread.find('.captcha').val();
    $.ajax({
        type: 'POST',
        url: '/captcha',
        contentType: 'application/json',
        data: JSON.stringify({
            url: url,
            captcha: captcha
        })
    }).done(function (res) {
        $thread.removeClass('failure');
        $thread.addClass('success');
        $thread.find('input, button').prop('disabled', true);
        if ($('input[type="checkbox"]:checked').length == $('.success').length) {
            selectGroup(currentGroup);
        }
    }).fail(function (jqxhr, status, error) {
        $thread.addClass('failure');
        console.log(status, error);
        refreshCaptcha(url);
    });
}

function refreshCaptcha (url) {
    $.ajax({
        type: 'GET',
        url: '/captcha',
        data: { url: url }
    }).done(function (captcha) {
        threadElemByUrl[url].find('.captcha-image').prop('src', captcha);
    });
}

function swapImages (img1, img2) {
    var ix1 = +img1.data('index');
    var ix2 = +img2.data('index');
    var tempSrc = img1.attr('src');
    var tempFile = files[ix1];
    img1.attr('src', img2.attr('src'));
    files[ix1] = files[ix2];
    img2.attr('src', tempSrc);
    files[ix2] = tempFile;
}

$fileControls
    .on('mousedown', 'img', function () {
        var $img = $(this);
        if ($img.attr('src'))
            draggedImage = $img;
        clickedImage = $img;
    })
    .on('mouseover', 'img', function () {
        if (draggedImage && draggedImage != this) {
            swapImages(draggedImage, $(this));
            draggedImage = $(this);
        }
    });

$(document)
    .on('mouseenter', '.thread-remove-button', function () {
        $(this).parents('.thread').addClass('thread-hover');
    })
    .on('mouseleave', '.thread-remove-button', function () {
        $(this).parents('.thread').removeClass('thread-hover');
    })
    .on('mouseup', function () {
        draggedImage = null;
    });

$postingInputs.prop('disabled', true);

$.get('/groups', function (groups) {
    for (var group in groups) {
        addGroup(group);
    }
});