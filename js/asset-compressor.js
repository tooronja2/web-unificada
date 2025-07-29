/**
 * Asset Compressor
 * Handles client-side compression and optimization of resources
 */

class AssetCompressor {
    constructor() {
        this.compressionLevel = this.detectCompressionSupport();
        this.cacheVersion = '1.0.0';
        this.criticalResources = new Set([
            '/css/pixel-hive.webflow.shared.css',
            '/css/growflix.webflow.shared.css',
            '/css/kitpro-juke.webflow.shared.css'
        ]);
        
        this.init();
    }
    
    init() {
        this.optimizeResourceLoading();
        this.setupCompressionHeaders();
        this.optimizeCriticalCSS();
        this.setupResourceHints();
    }
    
    /**
     * Detect browser compression support
     */
    detectCompressionSupport() {
        const supported = {
            brotli: false,
            gzip: false,
            deflate: false
        };
        
        if ('CompressionStream' in window) {
            try {
                supported.gzip = true;
                supported.deflate = true;
                // Check for Brotli support
                if ('brotli' in CompressionStream.prototype) {
                    supported.brotli = true;
                }
            } catch (e) {
                console.warn('Compression not fully supported');
            }
        }
        
        return supported;
    }
    
    /**
     * Optimize resource loading with compression hints
     */
    optimizeResourceLoading() {
        // Add compression headers for requests
        if ('serviceWorker' in navigator) {
            this.setupServiceWorkerCompression();
        }
        
        // Optimize fetch requests
        this.interceptFetchRequests();
    }
    
    /**
     * Setup compression headers
     */
    setupCompressionHeaders() {
        const originalFetch = window.fetch;
        
        window.fetch = (resource, options = {}) => {
            // Add compression headers
            const headers = new Headers(options.headers || {});
            
            if (this.compressionLevel.brotli) {
                headers.set('Accept-Encoding', 'br, gzip, deflate');
            } else if (this.compressionLevel.gzip) {
                headers.set('Accept-Encoding', 'gzip, deflate');
            }
            
            // Add cache control for static assets
            if (typeof resource === 'string' && this.isStaticAsset(resource)) {
                headers.set('Cache-Control', 'public, max-age=31536000');
            }
            
            return originalFetch(resource, {
                ...options,
                headers
            });
        };
    }
    
    /**
     * Check if resource is a static asset
     */
    isStaticAsset(url) {
        const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.woff', '.woff2'];
        return staticExtensions.some(ext => url.includes(ext));
    }
    
    /**
     * Optimize critical CSS
     */
    optimizeCriticalCSS() {
        // Inline critical CSS for above-the-fold content
        const criticalCSS = `
            /* Critical CSS for immediate rendering */
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            .navbar-wrapper { position: relative; z-index: 1000; }
            .home-hero-section { min-height: 100vh; position: relative; }
            .loading-placeholder { 
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            /* Hide non-critical content during initial load */
            .wf-loading .non-critical { opacity: 0; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        style.setAttribute('data-critical', 'true');
        document.head.insertBefore(style, document.head.firstChild);
    }
    
    /**
     * Setup resource hints for better loading
     */
    setupResourceHints() {
        const resourceHints = [
            // Preload critical images
            { rel: 'preload', as: 'image', href: '/images/680b4844d911c1e80b704859_Logo2.png' },
            
            // Prefetch likely next pages
            { rel: 'prefetch', href: '/about/' },
            { rel: 'prefetch', href: '/works/' },
            { rel: 'prefetch', href: '/contact/' }
        ];
        
        resourceHints.forEach(hint => {
            const link = document.createElement('link');
            Object.assign(link, hint);
            document.head.appendChild(link);
        });
    }
    
    /**
     * Setup service worker compression
     */
    setupServiceWorkerCompression() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered for compression');
                    
                    // Send compression capabilities to SW
                    if (registration.active) {
                        registration.active.postMessage({
                            type: 'COMPRESSION_SUPPORT',
                            support: this.compressionLevel
                        });
                    }
                })
                .catch(error => {
                    console.warn('Service Worker registration failed:', error);
                });
        }
    }
    
    /**
     * Intercept fetch requests for optimization
     */
    interceptFetchRequests() {
        // Monitor fetch performance
        const performanceObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'resource') {
                    this.trackResourcePerformance(entry);
                }
            }
        });
        
        try {
            performanceObserver.observe({ entryTypes: ['resource'] });
        } catch (e) {
            console.warn('Performance observer not supported');
        }
    }
    
    /**
     * Track resource performance
     */
    trackResourcePerformance(entry) {
        const loadTime = entry.responseEnd - entry.startTime;
        const resourceSize = entry.transferSize || 0;
        
        // Log slow resources
        if (loadTime > 1000) {
            console.warn(`Slow resource detected: ${entry.name} (${loadTime.toFixed(2)}ms, ${resourceSize} bytes)`);
        }
        
        // Track compression effectiveness
        if (entry.encodedBodySize && entry.decodedBodySize) {
            const compressionRatio = 1 - (entry.encodedBodySize / entry.decodedBodySize);
            if (compressionRatio > 0.1) {
                console.log(`Compression effective for ${entry.name}: ${(compressionRatio * 100).toFixed(1)}% reduction`);
            }
        }
    }
    
    /**
     * Optimize images with compression
     */
    optimizeImages() {
        const images = document.querySelectorAll('img[data-src], img[src]');
        
        images.forEach(img => {
            // Add compression hints for images
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Add decode hint for faster rendering
            img.setAttribute('decoding', 'async');
        });
    }
    
    /**
     * Compress text content where possible
     */
    compressTextContent() {
        if (this.compressionLevel.gzip && 'CompressionStream' in window) {
            // This would be used for storing large text content in cache
            this.setupTextCompression();
        }
    }
    
    /**
     * Setup text compression for caching
     */
    setupTextCompression() {
        const originalSetItem = localStorage.setItem;
        
        localStorage.setItem = function(key, value) {
            if (value.length > 1024) { // Only compress large items
                try {
                    // In a real implementation, you'd use a compression library
                    // This is a placeholder for the concept
                    console.log(`Compressing large cache item: ${key}`);
                } catch (e) {
                    console.warn('Compression failed for:', key);
                }
            }
            return originalSetItem.call(this, key, value);
        };
    }
}

// Initialize asset compressor
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AssetCompressor();
    });
} else {
    new AssetCompressor();
}

export default AssetCompressor;
