# CPEM N° 99 — Paso Aguerre · PWA Intercultural

Aplicación educativa intercultural para estudiantes de comunidades mapuches.
Funciona **completamente sin internet** una vez instalada.

## ✨ Novedades v1.1.0

### 🎯 Sistema de Módulos Dinámicos

La aplicación ahora utiliza un **sistema de módulos completamente dinámico**:

- ✅ Todos los módulos se definen en `contenido/modulos.json`
- ✅ Agregar nuevo contenido sin modificar código HTML
- ✅ Configuración centralizada y versionada
- ✅ Caché inteligente con Service Worker
- ✅ Renderizado automático de componentes

**Beneficio**: Los administradores pueden actualizar contenido editando solo JSON.

---

## 📁 Estructura de Archivos Nuevos

```
cpem99-pwa/
├── index.html                    ← App principal (ahora con módulos dinámicos)
├── manifest.json
├── sw.js
├── js/                           ✨ NUEVA CARPETA
│   ├── config.js                 ← Gestor de configuración
│   └── modules.js                ← Motor de renderizado
├── contenido/
│   ├── modulos.json              ✨ NUEVO - Centro del sistema
│   ├── diccionario.json          ← Palabras mapuche
│   ├── modulos/                  ← Estructura para nuevos módulos
│   │   ├── lengua.json
│   │   ├── ciencias-sociales.json
│   │   ├── cultura-identidad.json
│   │   └── territorio-comunidades.json
│   └── audio/                    ← Pronunciaciones (próximamente)
├── ejemplos/                     ✨ NUEVA CARPETA
│   └── uso-modulos.js            ← Ejemplos de implementación
├── MODULOS-DINAMICOS.md          ✨ NUEVA - Documentación técnica
├── GUIA-MODULOS.md               ✨ NUEVA - Guía de actualización
└── CHANGELOG.md                  ✨ NUEVA - Registro de cambios
```

---

## 🚀 Publicar en GitHub Pages

### 1. Crear cuenta en GitHub
- Entrá a https://github.com
- Hacé clic en **Sign up**
- Usá un correo del colegio, ej: `cpem99pague@gmail.com`
- Elegí un nombre de usuario, ej: `cpem99-pague`

### 2. Crear el repositorio
- Hacé clic en el botón verde **New** (o el ícono +)
- **Repository name:** `app`
- Marcá **Public** (obligatorio para GitHub Pages gratis)
- Marcá **Add a README file**
- Hacé clic en **Create repository**

### 3. Subir los archivos
- Dentro del repositorio, hacé clic en **Add file → Upload files**
- Arrastrá o seleccioná todos los archivos de esta carpeta
- En el campo de abajo escribí: `Primera versión de la PWA`
- Hacé clic en **Commit changes**

### 4. Activar GitHub Pages
- Andá a **Settings** (ícono de engranaje arriba a la derecha)
- En el menú izquierdo, hacé clic en **Pages**
- En **Source**, seleccioná **Deploy from a branch**
- En **Branch**, seleccioná `main` y carpeta `/ (root)`
- Hacé clic en **Save**
- Esperá 1-2 minutos y listo 🎉

### 5. La URL de la app
```
https://cpem99-pague.github.io/app
```

Compartís esa URL con los estudiantes por WhatsApp.
En Android, Chrome les va a ofrecer "Agregar a pantalla de inicio" → queda como app.

---

## 🔧 Actualizar Contenido

### Opción A: Por GitHub (recomendado)

1. Entrá a github.com con tu cuenta
2. Abrí el repositorio `app`
3. Hacé clic en **contenido → modulos.json**
4. Hacé clic en el ícono del lápiz (Edit this file)
5. Hacés los cambios
6. Abajo, en **Commit changes**, describí qué cambiaste
7. Hacé clic en **Commit changes**

→ En menos de 2 minutos, el cambio está vivo.

### Opción B: Por Desarrollo Local

1. Cloná el repositorio: `git clone https://github.com/tu-usuario/app.git`
2. Editá los archivos JSON
3. Hacé `git add .` → `git commit -m "Actualización"` → `git push`

---

## 📝 Agregar un Módulo Nuevo

### 1. Editar `contenido/modulos.json`

```json
{
  "id": "mi-modulo",
  "titulo": "Mi Nuevo Módulo",
  "subtitulo": "Descripción corta",
  "descripcion": "Descripción detallada",
  "icono": "📚",
  "color": "turq",
  "ruta": "modulos/mi-modulo.html",
  "badge": "Nuevo",
  "estado": "activo",
  "prioridad": 6,
  "audiencia": ["estudiantes"],
  "contenidoJSON": "contenido/modulos/mi-modulo.json"
}
```

### 2. Crear `modulos/mi-modulo.html`

Copiar estructura de `diccionario.html` o `historia.html`.

### 3. Crear `contenido/modulos/mi-modulo.json`

Definir estructura de datos del módulo.

**Listo!** El módulo aparecerá automáticamente.

---

## 🎨 Colores Disponibles

| Color | Uso |
|-------|-----|
| `turq` | Lenguaje, Cultura |
| `red` | Ciencias Sociales |
| `ocre` | Territorio, Geografía |
| `earth` | Historia, Tradición |

---

## 💾 Íconos Necesarios

Crear la carpeta `icons/` y agregar:
- `icon-192.png` — 192×192 píxeles
- `icon-512.png` — 512×512 píxeles

Generarlos gratis en: https://realfavicongenerator.net

---

## 🔊 Próximas Fases

### v1.2.0 - Audio y Pronunciación
- Reproducción de audio nativo para palabras mapuche
- Visualización de pronunciación IPA
- Descarga offline de audios

### v1.3.0 - Gamificación
- Sistema de puntos y badges
- Streaks de estudio
- Logros educativos

### v1.4.0 - Búsqueda Avanzada
- Búsqueda semántica
- Filtros por dificultad
- Historial de búsquedas

### v2.0.0 - Dashboard Educador
- Panel de control para docentes
- Estadísticas de estudiantes
- Asignación de tareas

---

## 📚 Documentación

- **[MODULOS-DINAMICOS.md](./MODULOS-DINAMICOS.md)** — Documentación técnica completa
- **[GUIA-MODULOS.md](./GUIA-MODULOS.md)** — Guía de actualización
- **[CHANGELOG.md](./CHANGELOG.md)** — Registro de cambios
- **[ejemplos/uso-modulos.js](./ejemplos/uso-modulos.js)** — Ejemplos de código

---

## 🐛 Debugging

### Ver estado del sistema
```javascript
// En la consola del navegador (F12)
Config.validar()        // ✅ Validar configuración
Config.exportar()       // 📊 Ver estado
Modules.exportar()      // 💾 Ver caché
```

---

## 🔗 Estructura Técnica

```
modulos.json (configuración)
    ↓
Config.cargar()
    ↓
Config (singleton global)
    ↓
Modules.renderizarGrid()
    ↓
DOM actualizado dinámicamente
```

---

## ✅ Versión Actual
- **v1.1.0** — Sistema de Módulos Dinámicos
  - ConfigManager centralizado
  - ModulesEngine dinámico
  - 5 módulos principales
  - Documentación completa

---

## 📞 Soporte

Para problemas:
1. Ver [GUIA-MODULOS.md](./GUIA-MODULOS.md) (sección Troubleshooting)
2. Revisar la consola del navegador (F12)
3. Ejecutar `Config.validar()` para diagnosticar
4. Consultar [MODULOS-DINAMICOS.md](./MODULOS-DINAMICOS.md) para referencia técnica

---

## 👥 Sobre Este Proyecto

**CPEM N° 99 — Paso Aguerre**
- Escuela secundaria en comunidades mapuches de Neuquén
- PWA intercultural desarrollada con tecnologías web modernas
- Completamente funcional sin conexión a internet
- Diseñada con respeto por la cultura mapuche

**Desarrollado por**: Copilot GitHub  
**Año**: 2026  
**Propósito**: Educación intercultural accesible

---

## 📄 Licencia

Proyecto educativo abierto para uso en CPEM N° 99 y comunidades mapuches.

