$(document).ready(function() {
    var lastScrollTop = 0;
    var scrollDirection;

    function trackScrollDirection() {
        var st = $(window).scrollTop();
        if (st > lastScrollTop) {
            scrollDirection = 'down';
        } else {
            scrollDirection = 'up';
        }
        lastScrollTop = st;
    }

    $(window).on('scroll', trackScrollDirection);

    function resetWebflowAnimations() {
        if (scrollDirection === 'up') {
            $('[data-w-id]').each(function() {
                var el = $(this);
                var initialDisplayStyle = el.css('display');

                // Check if the element is not visible in the viewport
                var rect = this.getBoundingClientRect();
                var isVisible = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );

                if (!isVisible) {
                    // Temporarily hide and show the element to force Webflow to re-evaluate its state
                    el.hide().show();
                }
            });
        }
    }

    // Debounce function to limit how often resetWebflowAnimations is called
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    var debouncedReset = debounce(resetWebflowAnimations, 250);

    $(window).on('scroll', function() {
        if (scrollDirection === 'up') {
            debouncedReset();
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Fix for the letter "g" getting cut off in animated headings
    const animatedHeadings = document.querySelectorAll('.insight-item-heading');
    
    animatedHeadings.forEach(function(heading) {
        // Add padding to prevent text clipping
        heading.style.paddingBottom = '6px';
        heading.style.lineHeight = '1.2';
        heading.style.overflow = 'visible';
        
        // If the heading contains text with descenders (g, j, p, q, y)
        if (heading.textContent.match(/[gjpqy]/)) {
            // Add extra padding at the bottom
            heading.style.paddingBottom = '8px';
            
            // Adjust the container height if needed
            const container = heading.closest('.insight-stat-col');
            if (container) {
                container.style.minHeight = 'calc(100% + 8px)';
            }
        }
    });
    
    // Fix for pricing section accent marks
    document.querySelectorAll('.heading-style-h4').forEach(function(element) {
        if (element.textContent.includes('Ba')) {
            element.innerHTML = 'Básico';
        }
    });
});
