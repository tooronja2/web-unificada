// Sistema de optimización de rendimiento
class PerformanceOptimizer {
    constructor() {
        this.lazyImages = [];
        this.lazyVideos = [];
        this.splineScenes = [];
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.preconnectToExternalDomains();
        this.optimizeSplineLoading();
        this.debounceAnimations();
    }

    setupIntersectionObserver() {
        // Lazy loading para imágenes
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Lazy loading para videos
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.dataset.src) {
                        video.src = video.dataset.src;
                        video.load();
                        observer.unobserve(video);
                    }
                }
            });
        }, {
            rootMargin: '100px'
        });

        // Observar todas las imágenes lazy
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Observar todos los videos lazy
        document.querySelectorAll('video[data-src]').forEach(video => {
            videoObserver.observe(video);
        });
    }

    preconnectToExternalDomains() {
        const externalDomains = [
            'https://cdn.prod.website-files.com',
            'https://prod.spline.design',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    optimizeSplineLoading() {
        // Cargar Spline solo cuando sea necesario
        const splineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const splineElement = entry.target;
                    this.loadSplineScene(splineElement);
                    splineObserver.unobserve(splineElement);
                }
            });
        }, {
            rootMargin: '200px'
        });

        document.querySelectorAll('[data-animation-type="spline"]').forEach(element => {
            splineObserver.observe(element);
        });
    }

    loadSplineScene(element) {
        // Implementación de carga diferida de Spline
        const splineUrl = element.dataset.splineUrl;
        if (splineUrl && !element.classList.contains('spline-loaded')) {
            element.classList.add('spline-loaded');
            // Aquí se cargaría la escena Spline de manera optimizada
        }
    }

    debounceAnimations() {
        // Reducir la frecuencia de animaciones en dispositivos lentos
        if (navigator.hardwareConcurrency <= 4) {
            document.documentElement.style.setProperty('--animation-duration', '0.8s');
        }
    }

    // Optimización de videos para móviles
    optimizeVideosForMobile() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('video').forEach(video => {
                // Reducir calidad en móviles
                video.style.transform = 'scale(0.9)';
                // Pausar videos no visibles
                if (!this.isElementInViewport(video)) {
                    video.pause();
                }
            });
        }
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Optimización de recursos por prioridad
    prioritizeResources() {
        // Priorizar carga de recursos críticos
        const criticalImages = document.querySelectorAll('img[data-priority="high"]');
        criticalImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }
}

// Inicializar optimizador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const optimizer = new PerformanceOptimizer();
    
    // Optimizar videos en scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            optimizer.optimizeVideosForMobile();
        }, 150);
    });
});

// Service Worker para cache avanzado
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('SW registration failed');
    });
}
