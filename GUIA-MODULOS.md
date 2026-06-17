# Guía de Actualización - Sistema de Módulos Dinámicos

## 🎯 ¿Qué cambió?

La aplicación ahora utiliza un **sistema de módulos dinámicos** que permite agregar y actualizar contenido sin modificar código HTML.

### Cambios Principales

```diff
- ❌ Módulos hardcodeados en index.html
+ ✅ Módulos definidos en contenido/modulos.json

- ❌ Configuración en archivos separados
+ ✅ Configuración centralizada y accesible

- ❌ Difícil de mantener
+ ✅ Fácil de extender
```

---

## 📦 Nuevos Archivos

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `config.js` | Gestor de configuración centralizado | `/js/` |
| `modules.js` | Motor de renderizado dinámico | `/js/` |
| `modulos.json` | Base de datos de módulos | `/contenido/` |
| `diccionario.json` | Base de datos de palabras mapuche | `/contenido/` |

---

## 🚀 ¿Cómo Agregar un Módulo Nuevo?

### Paso 1: Editar `contenido/modulos.json`

Agregar una entrada en el array `modulos`:

```json
{
  "id": "mi-nuevo-modulo",
  "titulo": "Mi Nuevo Módulo",
  "subtitulo": "Descripción corta",
  "descripcion": "Descripción detallada del contenido",
  "icono": "📚",
  "color": "turq",
  "ruta": "modulos/nuevo.html",
  "badge": "Nuevo",
  "estado": "activo",
  "prioridad": 6,
  "audiencia": ["estudiantes"],
  "contenidoJSON": "contenido/modulos/nuevo.json"
}
```

### Paso 2: Crear la página HTML

Crear `modulos/nuevo.html` siguiendo el patrón de `diccionario.html` o `historia.html`.

### Paso 3: Crear el archivo JSON con contenido (opcional)

Si tu módulo necesita datos dinámicos, crear `contenido/modulos/nuevo.json`.

### Paso 3: Agregar a categorías (opcional)

Si quieres que aparezca en una categoría, agregar su `id` al array `modulos` de la categoría:

```json
{
  "id": "mi-categoria",
  "nombre": "Mi Categoría",
  "modulos": ["diccionario", "mi-nuevo-modulo"]
}
```

---

## 🎨 Colores Disponibles

Los módulos pueden tener uno de estos colores:

| Color | Clase CSS | Uso |
|-------|-----------|-----|
| Turquesa | `turq` | Lenguaje, Cultura |
| Rojo/Terracota | `red` | Ciencias Sociales |
| Ocre | `ocre` | Territorio, Geografía |
| Tierra | `earth` | Historia, Tradición |

---

## 📝 Actualizar Información de un Módulo

Solo modificar el JSON, sin tocar código:

```json
{
  "id": "diccionario",
  "titulo": "Diccionario (Actualizado)",
  "subtitle": "Ahora con 500 palabras",
  "badge": "Actualizado"
}
```

El cambio será visible inmediatamente en la app.

---

## 🔊 Agregar Audio a Palabras

1. Colocar archivo de audio en `/contenido/audio/palabra.mp3`
2. Actualizar `diccionario.json`:

```json
{
  "id": "saludo-1",
  "es": "Hola",
  "mapu": "Mari mari",
  "pron": "ma-rí ma-rí",
  "audio": "audio/mari-mari.mp3",
  "audioDisponible": true
}
```

3. En diccionario.html, reproducir audio:

```javascript
const audio = new Audio(palabra.audio);
audio.play();
```

---

## 🏷️ Badgess Comunes

- `"Nuevo"` - Contenido recién agregado
- `"3 nuevo"` - Indica cantidad de items nuevos
- `"Actualizado"` - Contenido recientemente modificado
- `"En desarrollo"` - Próximamente disponible
- `null` - Sin badge

---

## 📊 Estadísticas de Uso

### Módulos Más Consultados

```javascript
// Ver qué módulos se usan más
const stats = localStorage.getItem('estadisticas');
console.log(JSON.parse(stats));
```

### Tiempo de Carga

```javascript
// Ver estado del caché
console.log(Modules.exportar());
```

---

## 🐛 Troubleshooting

### Los módulos no aparecen

1. Verificar que `modulos.json` esté en `/contenido/`
2. Validar JSON (https://jsonlint.com/)
3. Ver consola del navegador para errores
4. Ejecutar `Config.validar()` en consola

### El contenido se ve desalineado

1. Verificar que los colores están correctos en `modulos.json`
2. Revisar CSS en `index.html`

### El JSON no se carga

1. Verificar ruta del archivo (`/CPEM-99/contenido/modulos.json`)
2. Verificar que el servidor está sirviendo JSON con tipo correcto
3. Ver Network en DevTools

---

## 📚 Recursos

- [Documentación Completa](./MODULOS-DINAMICOS.md)
- [Especificación JSON Schema](./schemas/modulos.schema.json)
- [Ejemplos de Implementación](./ejemplos/)

---

## ✅ Verificar Que Todo Funciona

1. Abrir DevTools (F12)
2. Ejecutar en consola:
   ```javascript
   Config.validar()
   Config.exportar()
   Modules.exportar()
   ```
3. Ver mensaje "✅ Validación exitosa"

