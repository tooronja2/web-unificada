/**
 * Font Optimizer
 * Optimizes Google Fonts loading for better performance
 */

class FontOptimizer {
    constructor() {
        this.fonts = [
            {
                family: 'Poppins',
                weights: [300, 400, 500, 600, 700],
                display: 'swap'
            },
            {
                family: 'DM Sans',
                weights: [400, 500, 600, 700],
                display: 'swap'
            },
            {
                family: 'Inter',
                weights: [400, 500, 600, 700],
                display: 'swap'
            }
        ];
        
        this.init();
    }
    
    init() {
        this.preloadCriticalFonts();
        this.optimizeWebFont();
        this.addFontDisplayCSS();
    }
    
    /**
     * Preload critical font subsets
     */
    preloadCriticalFonts() {
        // Preload only the most critical fonts (400 and 600 weights)
        const criticalFonts = [
            'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2',
            'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2',
            'https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriOQ4EhD3Hpnw.woff2',
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
        ];
        
        criticalFonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = fontUrl;
            document.head.appendChild(link);
        });
    }
    
    /**
     * Optimize WebFont loading
     */
    optimizeWebFont() {
        if (window.WebFont) {
            window.WebFont.load({
                google: {
                    families: this.fonts.map(font => 
                        `${font.family}:${font.weights.join(',')}`
                    )
                },
                fontdisplay: 'swap',
                timeout: 3000,
                loading: () => {
                    document.documentElement.classList.add('wf-loading');
                },
                active: () => {
                    document.documentElement.classList.remove('wf-loading');
                    document.documentElement.classList.add('wf-active');
                    this.trackFontLoadingPerformance();
                },
                inactive: () => {
                    document.documentElement.classList.remove('wf-loading');
                    document.documentElement.classList.add('wf-inactive');
                    console.warn('Font loading failed or timed out');
                }
            });
        }
    }
    
    /**
     * Add font-display: swap CSS
     */
    addFontDisplayCSS() {
        const css = `
            @font-face {
                font-family: 'Poppins';
                font-display: swap;
            }
            @font-face {
                font-family: 'DM Sans';
                font-display: swap;
            }
            @font-face {
                font-family: 'Inter';
                font-display: swap;
            }
            
            /* Fallback fonts while loading */
            .wf-loading body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            /* Optimize font rendering */
            body {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    /**
     * Track font loading performance
     */
    trackFontLoadingPerformance() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            setTimeout(() => {
                const resourceEntries = performance.getEntriesByType('resource');
                const fontEntries = resourceEntries.filter(entry => 
                    entry.name.includes('fonts.gstatic.com') || 
                    entry.name.includes('webfont')
                );
                
                if (fontEntries.length > 0) {
                    const totalFontLoadTime = fontEntries.reduce((sum, entry) => 
                        sum + (entry.responseEnd - entry.startTime), 0
                    );
                    
                    console.log(`Font loading completed in ${totalFontLoadTime.toFixed(2)}ms`);
                    
                    // Track for analytics if needed
                    if (window.gtag) {
                        window.gtag('event', 'font_load_time', {
                            event_category: 'Performance',
                            value: Math.round(totalFontLoadTime)
                        });
                    }
                }
            }, 1000);
        }
    }
    
    /**
     * Preload fonts for next page navigation
     */
    preloadFontsForNavigation() {
        const links = document.querySelectorAll('a[href^="/"]');
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.preloadCriticalFonts();
            }, { once: true });
        });
    }
}

// Initialize font optimizer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FontOptimizer();
    });
} else {
    new FontOptimizer();
}

export default FontOptimizer;
