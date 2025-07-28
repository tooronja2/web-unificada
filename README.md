# Landing Page Unificada

Una landing page que combina tres proyectos web independientes en una experiencia de navegación fluida y scrolleable.

## 🚀 Demo en Vivo

[Ver Demo](https://tu-proyecto.vercel.app)

## 📋 Características

- **3 Proyectos Unificados**: KitPro, Pixel Hive y Growflix
- **Navegación Fluida**: Scroll suave entre secciones con scroll-snap
- **Responsive Design**: Optimizado para todos los dispositivos
- **Animaciones Preservadas**: Mantiene todas las animaciones originales de Webflow
- **Sin Conflictos**: CSS y JavaScript organizados sin interferencias

## 🛠️ Tecnologías

- HTML5
- CSS3 (Webflow Generated)
- JavaScript (Vanilla + jQuery)
- Animaciones CSS
- Scroll Snap API

## 📁 Estructura del Proyecto

```
├── index.html                 # Landing page unificada
├── css/                       # Estilos de los 3 proyectos
│   ├── kitpro-juke.webflow.shared.12889bc9f.min.css
│   ├── pixel-hive.webflow.shared.6a98837a7.css
│   └── growflix.webflow.6be85dae4.css
├── js/                        # Scripts de los 3 proyectos
├── images/                    # Imágenes del proyecto principal
├── Para Unir/                 # Recursos de proyectos originales
│   ├── Dona-Partes-2/         # Recursos de Pixel Hive
│   └── Elemento-3d/           # Recursos de Growflix
├── package.json               # Configuración del proyecto
├── vercel.json               # Configuración de Vercel optimizada
├── .gitignore                # Archivos a ignorar en Git
├── README.md                 # Documentación principal
└── UNIFICACION_DOCUMENTACION.md # Documentación técnica
```

## 🎯 Secciones

### Sección 1: KitPro
- **Tema**: "Where Design Meets Purpose"
- **Enfoque**: Diseño creativo y funcional
- **Navegación**: Enlaces a las otras secciones

### Sección 2: Pixel Hive
- **Tema**: "Creative Solutions"
- **Enfoque**: Soluciones de diseño innovadoras
- **Fondo**: Diferenciado visualmente

### Sección 3: Growflix
- **Tema**: Marketing Digital
- **Enfoque**: Crecimiento empresarial
- **Características**: Elementos 3D y animaciones

## 🚀 Deploy en Vercel

1. **Proyecto listo para deploy**:
   - El archivo principal ya está nombrado como `index.html`
   - Todas las rutas son relativas (no empiezan con `/`)
   - Archivos innecesarios eliminados

2. **Conecta con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa este repositorio
   - Deploy automático

3. **Configuración optimizada**:
   - El archivo `vercel.json` incluye cache headers optimizados
   - URLs limpias habilitadas
   - Trailing slashes deshabilitados

## 💻 Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/tu-repo.git

# Navegar al directorio
cd tu-repo

# Servir localmente (con cualquier servidor HTTP)
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx serve .

# Opción 3: PHP
php -S localhost:8000
```

## 🎨 Navegación

- **Scroll**: Navegación natural con scroll snap
- **Enlaces**: Navegación mediante enlaces en navbar
- **Botón Flotante**: Panel de navegación rápida (lateral derecho)
- **Navegación Suave**: Transiciones animadas entre secciones

## ⚡ Optimizaciones

- **Lazy Loading**: Imágenes optimizadas
- **CSS Minificado**: Estilos de producción
- **JavaScript Optimizado**: Scripts específicos por sección
- **SEO Ready**: Meta tags y estructura semántica

## 📱 Responsive

- **Mobile First**: Diseño optimizado para móviles
- **Tablet**: Experiencia adaptada para tablets
- **Desktop**: Experiencia completa en escritorio
- **Navegación Móvil**: Menús hamburguesa preservados

## 🔧 Personalización

Para personalizar el contenido:

1. **Textos**: Editar directamente en `index.html`
2. **Estilos**: Modificar archivos CSS en `/css/`
3. **Imágenes**: Reemplazar en las carpetas correspondientes
4. **Animaciones**: Ajustar en los archivos JavaScript

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Revisa la documentación en `UNIFICACION_DOCUMENTACION.md`
- Crea un issue en GitHub
- Contacta al desarrollador

## 📄 Licencia

Este proyecto combina elementos de tres proyectos Webflow independientes.
Consulta las licencias originales de cada template.

---

**Desarrollado con ❤️ para una experiencia web unificada**
