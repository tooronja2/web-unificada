$(document).ready(function() {
    var lastScrollTop = 0;
    var scrollDirection;
    var isReinitializing = false;

    function trackScrollDirection() {
        var st = $(window).scrollTop();
        if (st > lastScrollTop) {
            scrollDirection = 'down';
        } else if (st < lastScrollTop) {
            scrollDirection = 'up';
        }
        lastScrollTop = st;
    }

    $(window).on('scroll', trackScrollDirection);

    function reinitWebflow() {
        if (scrollDirection === 'up' && !isReinitializing) {
            isReinitializing = true;
            var scrollPosition = $(window).scrollTop();

            if (window.Webflow) {
                window.Webflow.destroy();
                window.Webflow.ready();
                window.Webflow.require('ix2').init();
            }

            $('html, body').scrollTop(scrollPosition);

            setTimeout(function() {
                isReinitializing = false;
            }, 500);
        }
    }

    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    var debouncedReinit = debounce(reinitWebflow, 300);

    $(window).on('scroll', debouncedReinit);
});