// Optimizador específico para elementos 3D y Spline
class SplineOptimizer {
    constructor() {
        this.loadedScenes = new Set();
        this.observerOptions = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };
        this.init();
    }

    init() {
        this.optimizeSplineElements();
        this.optimizeCSSAnimations();
        this.setupPerformanceMonitoring();
    }

    optimizeSplineElements() {
        const splineElements = document.querySelectorAll('[data-animation-type="spline"]');
        
        splineElements.forEach(element => {
            // Añadir placeholder mientras no se carga
            this.addSplinePlaceholder(element);
            
            // Observer para carga bajo demanda
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.loadedScenes.has(element)) {
                        this.loadSplineScene(element);
                        observer.unobserve(element);
                    }
                });
            }, this.observerOptions);
            
            observer.observe(element);
        });
    }

    addSplinePlaceholder(element) {
        if (!element.querySelector('.spline-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'spline-placeholder';
            placeholder.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
                           linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
                           linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                opacity: 0.1;
                pointer-events: none;
                transition: opacity 0.3s ease;
            `;
            element.appendChild(placeholder);
        }
    }

    async loadSplineScene(element) {
        if (this.loadedScenes.has(element)) return;
        
        try {
            const splineUrl = element.dataset.splineUrl;
            if (!splineUrl) return;

            // Marcar como cargando
            element.classList.add('spline-loading');
            
            // Precargar de manera inteligente
            await this.preloadSplineAssets(splineUrl);
            
            // Cargar la escena
            this.loadedScenes.add(element);
            element.classList.remove('spline-loading');
            element.classList.add('spline-loaded');
            
            // Remover placeholder
            const placeholder = element.querySelector('.spline-placeholder');
            if (placeholder) {
                placeholder.style.opacity = '0';
                setTimeout(() => placeholder.remove(), 300);
            }
            
        } catch (error) {
            console.warn('Error loading Spline scene:', error);
            element.classList.add('spline-error');
        }
    }

    async preloadSplineAssets(splineUrl) {
        // Implementar precarga inteligente de assets Spline
        return new Promise((resolve) => {
            // Simular carga optimizada
            setTimeout(resolve, 100);
        });
    }

    optimizeCSSAnimations() {
        // Reducir animaciones en dispositivos de bajo rendimiento
        const isLowEndDevice = this.detectLowEndDevice();
        
        if (isLowEndDevice) {
            document.documentElement.style.setProperty('--animation-duration-multiplier', '1.5');
            document.documentElement.style.setProperty('--transform-will-change', 'auto');
            
            // Simplificar animaciones complejas
            const complexAnimations = document.querySelectorAll('._3d-cube-wrapper, ._3d-cube-box');
            complexAnimations.forEach(element => {
                element.style.transform = element.style.transform.replace(/rotateX\([^)]+\)/g, 'rotateX(0deg)');
            });
        }
    }

    detectLowEndDevice() {
        // Detectar dispositivos de bajo rendimiento
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        const deviceMemory = navigator.deviceMemory || 4;
        const connection = navigator.connection;
        
        return (
            hardwareConcurrency <= 4 ||
            deviceMemory <= 4 ||
            (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'))
        );
    }

    setupPerformanceMonitoring() {
        // Monitorear rendimiento y ajustar dinámicamente
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'measure' && entry.duration > 16) {
                        this.reduceAnimationComplexity();
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        }
    }

    reduceAnimationComplexity() {
        // Reducir complejidad dinámicamente si hay problemas de rendimiento
        const animatedElements = document.querySelectorAll('[data-w-id]');
        animatedElements.forEach(element => {
            if (element.style.willChange !== 'auto') {
                element.style.willChange = 'auto';
            }
        });
    }

    // Pausar animaciones fuera de viewport
    pauseOffscreenAnimations() {
        const animatedElements = document.querySelectorAll('._3d-cube-wrapper, .spline-scene');
        
        animatedElements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        element.style.animationPlayState = 'running';
                        element.style.animationDuration = 'var(--animation-duration, 1s)';
                    } else {
                        element.style.animationPlayState = 'paused';
                    }
                });
            }, { rootMargin: '50px' });
            
            observer.observe(element);
        });
    }
}

// CSS optimizado para elementos 3D
const optimizedCSS = `
<style>
/* Optimizaciones para elementos 3D */
._3d-cube-wrapper,
._3d-cube-box,
.spline-scene {
    contain: layout style paint;
    will-change: auto;
}

/* Reducir complejidad en móviles */
@media (max-width: 768px) {
    ._3d-cube-wrapper {
        transform: scale(0.8) !important;
    }
    
    .spline-scene {
        transform: scale(0.9) !important;
    }
}

/* Optimización para dispositivos de bajo rendimiento */
@media (prefers-reduced-motion: reduce) {
    ._3d-cube-wrapper,
    ._3d-cube-box,
    .spline-scene {
        animation: none !important;
        transform: none !important;
    }
}

/* Placeholder para Spline */
.spline-placeholder {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.2; }
}

.spline-loading {
    opacity: 0.7;
}

.spline-loaded {
    opacity: 1;
    transition: opacity 0.5s ease;
}

.spline-error {
    background: #222;
    display: flex;
    align-items: center;
    justify-content: center;
}

.spline-error::after {
    content: "3D Scene Unavailable";
    color: #666;
    font-size: 14px;
}
</style>
`;

// Inyectar CSS optimizado
document.head.insertAdjacentHTML('beforeend', optimizedCSS);

// Inicializar optimizador Spline
document.addEventListener('DOMContentLoaded', () => {
    const splineOptimizer = new SplineOptimizer();
    splineOptimizer.pauseOffscreenAnimations();
});
