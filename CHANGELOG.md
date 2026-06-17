# Registro de Cambios - v1.1.0

## 🚀 Nuevas Características

### Sistema de Módulos Dinámicos

- **ConfigManager**: Gestor centralizado de configuración
  - Carga automática de `modulos.json`
  - Métodos para filtrar y buscar módulos
  - Sistema de observadores para cambios
  - Validación automática de estructura

- **ModulesEngine**: Motor de renderizado dinámico
  - Renderización de grids de módulos
  - Renderización de listas de actividades
  - Renderización de categorías
  - Caché de contenido automático
  - Carga paralela de múltiples módulos

- **modulos.json**: Base de datos de módulos
  - 5 módulos principales pre-configurados
  - 3 categorías educativas
  - Sistema de prioridades
  - Metadatos para audiencias específicas

- **diccionario.json**: Base de datos de palabras mapuche
  - 4 categorías semánticas
  - 11 palabras de ejemplo
  - Estructura para audios y contexto
  - Sistema de colores por categoría

### Mejoras de Interfaz

- Renderizado dinámico de módulos en `index.html`
- Sistema de animación de entrada para módulos
- Indicadores de módulos "nuevos"
- Listado dinámico de actividades recientes

### Documentación

- `MODULOS-DINAMICOS.md`: Documentación técnica completa
- `GUIA-MODULOS.md`: Guía de actualización para administradores
- `CHANGELOG.md`: Este archivo

---

## 🔧 Cambios Técnicos

### Archivos Nuevos

```
js/
├── config.js (✨ nuevo)
└── modules.js (✨ nuevo)

contenido/
├── modulos.json (✨ nuevo)
├── diccionario.json (✨ actualizado)
└── modulos/
    └── (estructura preparada para nuevos módulos)
```

### Archivos Modificados

- **index.html**: Ahora carga `config.js` y `modules.js`
  - Renderizado dinámico de módulos
  - Inicialización mejorada con `inicializarHome()`
  - Integración con sistema de configuración

### Estructura JSON

#### modulos.json - Propiedades Nuevas

```json
{
  "version": "1.0.0",
  "modulos": [
    {
      "contenidoJSON": "ruta/al/json",
      "audiosDisponibles": true,
      "tieneMapas": false,
      "audiencia": ["estudiantes", "docentes"]
    }
  ]
}
```

#### diccionario.json - Propiedades Nuevas

```json
{
  "palabras": [
    {
      "audio": "audio/palabra.mp3",
      "audioDisponible": false,
      "contexto": "Uso cultural",
      "ejemplo": "Frase de ejemplo"
    }
  ]
}
```

---

## ⚠️ Cambios Que Requieren Atención

### Rutas de Archivos

- Los scripts deben estar en `/js/` (nueva carpeta)
- Los JSONs deben estar en `/contenido/` (nueva estructura)
- Las rutas deben ser relativas desde la raíz: `/CPEM-99/...`

### Service Worker

El `sw.js` ya cachea `modulos.json` automáticamente. Actualizar si se agregan nuevos archivos JSON.

---

## 🐛 Bugs Corregidos

- ~~Módulos hardcodeados en HTML~~ → Ahora dinámicos
- ~~Difícil de agregar contenido~~ → JSON centralizado
- ~~Sin validación de datos~~ → Sistema de validación

---

## 📊 Performance

- **Antes**: 36.7 KB (index.html completo)
- **Ahora**: 32.7 KB (index.html) + 8.5 KB (config.js) + 10.1 KB (modules.js)
- **Caché**: config.js y modules.js se cachean con Service Worker
- **Carga**: Módulos se cargan bajo demanda (lazy loading)

---

## 🔄 Migración desde v1.0.0

### Para Usuarios de la Aplicación
✅ Sin cambios visibles (interfaz igual)

### Para Administradores
1. Usar `GUIA-MODULOS.md` para agregar módulos
2. Editar solo `modulos.json` para cambios
3. No tocar `config.js` ni `modules.js` (a menos que sepas JavaScript)

### Para Desarrolladores
1. Leer `MODULOS-DINAMICOS.md` para entender la arquitectura
2. Extender `ConfigManager` si se necesita lógica especial
3. Extender `ModulesEngine` para nuevos tipos de renderizado

---

## 📋 Próximas Fases

### v1.2.0 - Audio y Pronunciación
- [ ] Reproducción de audio nativo
- [ ] Visualización de pronunciación IPA
- [ ] Sincronización offline de audios

### v1.3.0 - Gamificación
- [ ] Sistema de puntos
- [ ] Badges y logros
- [ ] Streaks de estudio

### v1.4.0 - Búsqueda Avanzada
- [ ] Búsqueda semántica
- [ ] Filtros por dificultad
- [ ] Historial de búsquedas

### v2.0.0 - Dashboard Educador
- [ ] Panel de control para docentes
- [ ] Estadísticas de estudiantes
- [ ] Asignación de tareas

---

## 👥 Contribuyentes

- Sistema diseñado por: Copilot
- Validado para: CPEM N° 99
- Fecha: 17-06-2026

---

## 📞 Soporte

Para problemas:
1. Ver `GUIA-MODULOS.md` (sección Troubleshooting)
2. Revisar la consola del navegador
3. Ejecutar `Config.validar()` para diagnosticar
4. Consultar `MODULOS-DINAMICOS.md` para referencia técnica

---

## 📄 Licencia

Este sistema es parte de CPEM N° 99 — Paso Aguerre.
Desarrollado como herramienta educativa intercultural.

