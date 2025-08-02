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
    
    // 4. Fix font weights for paragraphs
    document.querySelectorAll('p, .text-size-small').forEach(function(element) {
        element.style.fontWeight = '400';
    });
    
    // 5. Replace English text with Spanish in GROWFLIX section
    const textReplacements = {
        'Strategy': 'Estrategia',
        'Branding': 'Marca',
        'Advertising': 'Publicidad',
        'Content': 'Contenido',
        'Making Ideas Happen': 'Hacemos Realidad Tus Ideas',
        'Success Stories': 'Casos de Éxito',
        'Case Studies': 'Proyectos',
        'Learn More': 'Saber Más',
        'Browse all': 'Ver Todos'
    };
    
    // Find and replace text in elements
    document.querySelectorAll('h2, h3, div, span, a').forEach(function(element) {
        Object.keys(textReplacements).forEach(function(english) {
            if (element.textContent.includes(english)) {
                element.textContent = element.textContent.replace(
                    new RegExp(english, 'g'), 
                    textReplacements[english]
                );
            }
        });
    });
    
    // 6. Fix pricing section accent marks
    document.querySelectorAll('.pricing-level-wrapper h4').forEach(function(heading) {
        if (heading.textContent.includes('Básico')) {
            heading.textContent = 'Básico'; // Replace with proper accent
        }
    });
    
    // 7. Move pricing section to before the call-to-action section
    const pricingSection = document.querySelector('.pricing-section');
    const callToAction = document.querySelector('.call-to-action-01');
    
    if (pricingSection && callToAction && callToAction.parentNode) {
        callToAction.parentNode.insertBefore(pricingSection, callToAction);
    }
    
    // 8. Increase contrast for "Solicitar Custom" button
    const customButtons = document.querySelectorAll('.text-align-center .primary-button');
    customButtons.forEach(function(button) {
        button.style.backgroundColor = '#FFFFFF';
        button.style.color = '#000000';
    });
    
    // 9. Fix all footer links to be white
    document.querySelectorAll('.footer a, .footer .link-text').forEach(function(link) {
        link.style.color = '#FFFFFF';
    });
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
