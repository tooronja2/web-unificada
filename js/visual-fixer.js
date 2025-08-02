/**
 * Script para corregir problemas visuales y aplicar unificación gráfica
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Corregir acentos en toda la página
    fixAccents();
    
    // 2. Asegurar colores correctos
    applyColorScheme();
    
    // 3. Reordenar secciones si es necesario
    reorganizeSections();
});

function fixAccents() {
    // Seleccionar todos los textos relevantes
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a');
    
    textElements.forEach(el => {
        if (el.childNodes && el.childNodes.length > 0) {
            el.childNodes.forEach(node => {
                if (node.nodeType === 3) { // Text node
                    node.textContent = node.textContent
                        .replace(/Â/g, '')
                        .replace(/â/g, '')
                        .replace(/\s+/g, ' ');
                }
            });
        }
    });
}

function applyColorScheme() {
    // Aplicar esquema de colores uniforme
    const elementsToFix = [
        {
            selector: '[style*="background-color: #0072C6"]',
            props: {
                backgroundColor: '#333333',
                color: '#FFFFFF'
            }
        },
        {
            selector: '.pricing-plan-button.is-popular',
            props: {
                backgroundColor: '#333333',
                color: '#FFFFFF'
            }
        },
        {
            selector: '.primary-button',
            props: {
                backgroundColor: '#FFFFFF',
                color: '#000000'
            }
        }
    ];
    
    elementsToFix.forEach(config => {
        document.querySelectorAll(config.selector).forEach(el => {
            Object.keys(config.props).forEach(prop => {
                el.style[prop] = config.props[prop];
            });
        });
    });
}

function reorganizeSections() {
    // Mover la sección de precios cerca del final si es necesario
    const pricingSection = document.querySelector('.pricing-section');
    const pageWrapper = document.querySelector('.page-wrapper');
    
    if (pricingSection && pageWrapper) {
        // Verificar si la sección de precios no está ya en la posición correcta
        const sections = pageWrapper.querySelectorAll('section');
        if (sections.length > 3 && sections[2] === pricingSection) {
            // Mover la sección después del tercero desde el final
            const targetIndex = Math.max(0, sections.length - 3);
            pageWrapper.insertBefore(pricingSection, sections[targetIndex]);
        }
    }
}
