(function () {
    var i18n = {
        "es": {
            "Close": "Cerrar",
            "Next": "Próximo",
            "Previous": "Previo"
        },
        "fr": {
            "Close": "Fermer",
            "Next": "Suivant",
            "Previous": "Précédent"
        },
        "it": {
            "Close": "Chiudere",
            "Next": "Prossimo",
            "Previous": "Precedente"
        }
    };
    var TTM_LIGHTBOX_ID = 'ttm-lightbox';
    var TTM_LIGHTBOX_CLASS = 'ttm-lightbox';
    var TTM_LIGHTBOX_INNER_CLASS = 'ttm-lightbox-inner';
    var TTM_LIGHTBOX_INNER_SELECTOR = '.' + TTM_LIGHTBOX_INNER_CLASS;
    var TTM_LIGHTBOX_IMAGE_CLASS = 'ttm-lightbox-image';
    var TTM_LIGHTBOX_IMAGE_SELECTOR = '.' + TTM_LIGHTBOX_IMAGE_CLASS;
    var TTM_LIGHTBOX_CAPTION_CLASS = 'ttm-lightbox-caption';
    var TTM_LIGHTBOX_CAPTION_SELECTOR = '.' + TTM_LIGHTBOX_CAPTION_CLASS;
    var TTM_LIGHTBOX_ACTIVE_CLASS = 'ttm-lightbox-active';
    var TTM_LIGHTBOX_SHOW_CLASS = 'ttm-lightbox-show';
    var TTM_LIGHTBOX_FADE_CLASS = 'ttm-lightbox-fade';
    var TTM_LIGHTBOX_DISABLED_CLASS = 'ttm-lightbox-disabled';
    var TTM_LIGHTBOX_SCREENREADER_CLASS = 'ttm-lightbox-screen-reader-text';
    var TTM_LIGHTBOX_BUTTON_CLASS = 'ttm-lightbox-button';
    var TTM_LIGHTBOX_NAV_CLASS = 'ttm-lightbox-nav';
    var TTM_LIGHTBOX_CLOSE_CLASS = 'ttm-lightbox-close';
    var TTM_LIGHTBOX_PREV_CLASS = 'ttm-lightbox-prev';
    var TTM_LIGHTBOX_NEXT_CLASS = 'ttm-lightbox-next';
    var TTM_LIGHTBOX_CLOSE_SELECTOR = '.' + TTM_LIGHTBOX_CLOSE_CLASS;
    var TTM_LIGHTBOX_PREV_SELECTOR = '.' + TTM_LIGHTBOX_PREV_CLASS;
    var TTM_LIGHTBOX_NEXT_SELECTOR = '.' + TTM_LIGHTBOX_NEXT_CLASS;
    var TTM_LIGHTBOX_IMAGE_ATTRIBUTE = 'data-lightbox';
    var TTM_LIGHTBOX_IMAGE_ATTRIBUTE_SELECTOR = '[' + TTM_LIGHTBOX_IMAGE_ATTRIBUTE + ']';
    var TTM_LIGHTBOX_TIMEOUT_SHORT = 50;
    var TTM_LIGHTBOX_TIMEOUT_LONG = 300;
    var lastFocus = null;
    var touchstartX = 0;
    var touchendX = 0;
    var keydownEvent = function (event) {
        if (!hasLightbox())
            return;
        switch (event.key) {
            case 'ArrowLeft':
                moveLightbox(-1);
                document.querySelector(TTM_LIGHTBOX_PREV_SELECTOR).focus();
                break;
            case 'ArrowRight':
                moveLightbox(1);
                document.querySelector(TTM_LIGHTBOX_NEXT_SELECTOR).focus();
                break;
            case 'Escape':
                closeLightbox();
                break;
        }
    };
    var addImgToLightbox = function (img) {
        var lightbox = getLightbox();
        lightbox.querySelectorAll(TTM_LIGHTBOX_IMAGE_SELECTOR).forEach(function (img) {
            img.classList.add(TTM_LIGHTBOX_FADE_CLASS);
            setTimeout(function () {
                img.remove();
            }, TTM_LIGHTBOX_TIMEOUT_LONG);
        });
        lightbox.querySelectorAll(TTM_LIGHTBOX_CAPTION_SELECTOR).forEach(function (caption) {
            caption.classList.add(TTM_LIGHTBOX_FADE_CLASS);
            setTimeout(function () {
                caption.remove();
            }, TTM_LIGHTBOX_TIMEOUT_LONG);
        });
        var inner = getInnerLightbox();
        var temp = img.cloneNode();
        temp.removeAttribute(TTM_LIGHTBOX_IMAGE_ATTRIBUTE);
        var clone = temp.cloneNode(temp);
        clone.classList.add(TTM_LIGHTBOX_IMAGE_CLASS);
        clone.classList.add(TTM_LIGHTBOX_FADE_CLASS);
        inner.appendChild(clone);
        var alt = img.getAttribute('alt');
        if (alt.length > 0) {
            var caption = createElement('div', { 'class': TTM_LIGHTBOX_CAPTION_CLASS });
            var p = createElement('p', {});
            var altNode = document.createTextNode(alt);
            p.appendChild(altNode);
            caption.appendChild(p);
            inner.appendChild(caption);
        }
        setTimeout(function () { clone.classList.remove(TTM_LIGHTBOX_FADE_CLASS); }, TTM_LIGHTBOX_TIMEOUT_SHORT);
        var prev = document.querySelector(TTM_LIGHTBOX_PREV_SELECTOR);
        if (isFirstImageInLightbox(img.src)) {
            disableElement(prev);
        }
        else {
            enableElement(prev);
        }
        var next = document.querySelector(TTM_LIGHTBOX_NEXT_SELECTOR);
        if (isLastImageInLightbox(img.src)) {
            disableElement(next);
            document.querySelector(TTM_LIGHTBOX_CLOSE_SELECTOR).focus();
        }
        else {
            enableElement(next);
        }
    };
    var enableElement = function (el) {
        el.classList.remove(TTM_LIGHTBOX_DISABLED_CLASS);
        el.disabled = false;
    };
    var disableElement = function (el) {
        el.classList.add(TTM_LIGHTBOX_DISABLED_CLASS);
        el.disabled = true;
    };
    var isFirstImageInLightbox = function (src) {
        var subset = getCurrentLightboxSubset();
        return src === subset[0].getAttribute('src');
    };
    var isLastImageInLightbox = function (src) {
        var subset = getCurrentLightboxSubset();
        return src === subset[subset.length - 1].getAttribute('src');
    };
    var getCurrentLightboxImage = function () {
        var lightbox = getLightbox();
        return lightbox.querySelector('img');
    };
    var getCurrentLightboxSubset = function () {
        var current = getCurrentLightboxImage();
        var images = document.querySelectorAll(TTM_LIGHTBOX_IMAGE_ATTRIBUTE_SELECTOR);
        var attribute = '';
        for (var i = 0; i < images.length; i++) {
            if (images[i].getAttribute('src') === current.getAttribute('src')) {
                attribute = images[i].getAttribute(TTM_LIGHTBOX_IMAGE_ATTRIBUTE);
            }
        }
        var subset = document.querySelectorAll('[' + TTM_LIGHTBOX_IMAGE_ATTRIBUTE + '="' + attribute + '"]');
        return subset;
    };
    var moveLightbox = function (amt) {
        var current = getCurrentLightboxImage();
        var subset = getCurrentLightboxSubset();
        for (var i = 0; i < subset.length; i++) {
            if (current.getAttribute('src') === subset[i].getAttribute('src') &&
                i + amt < subset.length &&
                i + amt >= 0) {
                addImgToLightbox(subset[i + amt]);
                return;
            }
        }
    };
    var boxClickEvent = function (img) {
        showLightbox();
        addImgToLightbox(img);
    };
    var showLightbox = function () {
        document.body.classList.add(TTM_LIGHTBOX_ACTIVE_CLASS);
        createLightbox();
        var lightbox = getLightbox();
        var inner = getInnerLightbox();
        setTimeout(function () { lightbox.classList.add(TTM_LIGHTBOX_SHOW_CLASS); }, TTM_LIGHTBOX_TIMEOUT_SHORT);
        setTimeout(function () { inner.classList.add(TTM_LIGHTBOX_SHOW_CLASS); }, TTM_LIGHTBOX_TIMEOUT_LONG);
        lightbox.addEventListener('click', function (e) {
            if (e.target !== e.currentTarget)
                return;
            closeLightbox();
        });
    };
    var closeLightbox = function () {
        var lightbox = getLightbox();
        var inner = getInnerLightbox();
        inner.classList.remove(TTM_LIGHTBOX_SHOW_CLASS);
        setTimeout(function () {
            lightbox.classList.remove(TTM_LIGHTBOX_SHOW_CLASS);
            setTimeout(function () {
                lightbox.remove();
                document.body.classList.remove(TTM_LIGHTBOX_ACTIVE_CLASS);
            }, TTM_LIGHTBOX_TIMEOUT_SHORT);
        }, TTM_LIGHTBOX_TIMEOUT_LONG);
        if (lastFocus !== null) {
            lastFocus.focus();
        }
    };
    var getLightbox = function () { return document.getElementById(TTM_LIGHTBOX_ID); };
    var hasLightbox = function () { return getLightbox() !== null; };
    var getInnerLightbox = function () {
        var lightbox = getLightbox();
        return lightbox.querySelector(TTM_LIGHTBOX_INNER_SELECTOR);
    };
    var createElement = function (name, atts) {
        var el = document.createElement(name);
        for (var _i = 0, _a = Object.entries(atts); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (Array.isArray(value)) {
                value = value.join(' ');
            }
            el.setAttribute(key, value);
        }
        return el;
    };
    var createLightbox = function () {
        if (hasLightbox())
            return;
        var lightbox = createElement('div', { 'id': TTM_LIGHTBOX_ID, 'class': TTM_LIGHTBOX_CLASS });
        var inner = document.createElement('div');
        inner.setAttribute('class', TTM_LIGHTBOX_INNER_CLASS);
        lightbox.appendChild(inner);
        var close = createElement('button', { 'class': [TTM_LIGHTBOX_CLOSE_CLASS, TTM_LIGHTBOX_BUTTON_CLASS] });
        var closeSpan = createElement('span', { 'class': TTM_LIGHTBOX_SCREENREADER_CLASS });
        var closeText = document.createTextNode(__('Close'));
        closeSpan.appendChild(closeText);
        close.appendChild(closeSpan);
        close.addEventListener('click', closeLightbox);
        inner.appendChild(close);
        var prev = createElement('button', { 'class': [TTM_LIGHTBOX_PREV_CLASS, TTM_LIGHTBOX_NAV_CLASS, TTM_LIGHTBOX_BUTTON_CLASS] });
        var prevSpan = createElement('span', { 'class': TTM_LIGHTBOX_SCREENREADER_CLASS });
        var prevText = document.createTextNode(__('Previous'));
        prevSpan.appendChild(prevText);
        prev.appendChild(prevSpan);
        prev.addEventListener('click', function () { return moveLightbox(-1); });
        inner.appendChild(prev);
        var next = createElement('button', { 'class': [TTM_LIGHTBOX_NEXT_CLASS, TTM_LIGHTBOX_NAV_CLASS, TTM_LIGHTBOX_BUTTON_CLASS] });
        var nextSpan = createElement('span', { 'class': TTM_LIGHTBOX_SCREENREADER_CLASS });
        var nextText = document.createTextNode(__('Next'));
        nextSpan.appendChild(nextText);
        next.appendChild(nextSpan);
        next.addEventListener('click', function () { return moveLightbox(1); });
        inner.appendChild(next);
        document.body.appendChild(lightbox);
        document.querySelector(TTM_LIGHTBOX_NEXT_SELECTOR).focus();
    };
    var __ = function (valueToTranslate) {
        var lang = navigator.language;
        if (null == i18n[lang]) {
            lang = lang.slice(0, lang.indexOf('-'));
        }
        if (null == i18n[lang]) {
            return valueToTranslate;
        }
        if (null == i18n[lang][valueToTranslate]) {
            return valueToTranslate;
        }
        return i18n[lang][valueToTranslate];
    };
    function checkDirection() {
        if (touchendX < touchstartX) {
            moveLightbox(1);
        }
        if (touchendX > touchstartX) {
            moveLightbox(-1);
        }
    }
    document.addEventListener('touchstart', function (e) {
        touchstartX = e.changedTouches[0].screenX;
    });
    document.addEventListener('touchend', function (e) {
        touchendX = e.changedTouches[0].screenX;
        if (hasLightbox()) {
            checkDirection();
        }
    });
    addEventListener('keydown', keydownEvent);
    document.querySelectorAll(TTM_LIGHTBOX_IMAGE_ATTRIBUTE_SELECTOR).forEach(function (box) {
        box.setAttribute('tabindex', '0');
        box.setAttribute('role', 'button');
        box.addEventListener('click', function () { boxClickEvent(box); });
        box.addEventListener('keydown', function (event) {
            lastFocus = event.target;
            if (event.code === 'Space' || event.code === 'Enter') {
                box.click();
            }
            if (hasLightbox()) {
                document.querySelector(TTM_LIGHTBOX_NEXT_SELECTOR).focus();
            }
        });
    });
})();
//# sourceMappingURL=ttm-lightbox.js.map