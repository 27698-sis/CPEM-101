/**
 * ═══════════════════════════════════════════════════════════════
 *  MODULES.JS — Motor de Módulos Dinámicos
 *  CPEM N° 99 — Sistema de Módulos Dinámicos v1.0
 * ═══════════════════════════════════════════════════════════════
 */

class ModulesEngine {
  constructor() {
    this.modulosCargados = {};
    this.contenidoEnCache = new Map();
    this.esperandoCarga = new Map();
  }

  /**
   * Renderizar grid de módulos dinámicamente
   * @param {Array} modulos - Array de módulos a renderizar
   * @param {HTMLElement} contenedor - Elemento donde renderizar
   * @param {Object} opciones - Opciones de renderizado
   */
  async renderizarGrid(modulos, contenedor, opciones = {}) {
    if (!contenedor) return;
    
    const {
      clase = 'modules-grid',
      onclick = null,
      mostrarBadge = true,
      animarEntrada = true
    } = opciones;

    let html = `<div class="${clase}">`;

    for (const modulo of modulos) {
      const colorClase = `mc-${modulo.color}`;
      const badgeHTML = mostrarBadge && modulo.badge 
        ? `<div class="module-badge">${modulo.badge}</div>` 
        : '';
      
      const clickHandler = onclick 
        ? `onclick="${onclick}('${modulo.id}')"` 
        : `onclick="location.href='${modulo.ruta}'"`;

      html += `
        <div class="module-card ${colorClase}" ${clickHandler} 
             data-modulo-id="${modulo.id}" 
             data-animado="${animarEntrada}">
          ${badgeHTML}
          <div class="module-icon">
            ${this.getSVGIcono(modulo.icono)}
          </div>
          <div class="module-title">${modulo.titulo}</div>
          <div class="module-sub">${modulo.subtitulo}</div>
        </div>
      `;
    }

    html += '</div>';
    contenedor.innerHTML = html;

    if (animarEntrada) {
      this.animar(contenedor);
    }

    return true;
  }

  /**
   * Renderizar lista de actividades/items recientes
   */
  async renderizarLista(items, contenedor, opciones = {}) {
    if (!contenedor) return;

    const {
      clase = 'activity-list',
      template = null
    } = opciones;

    let html = `<div class="${clase}">`;

    for (const item of items) {
      if (template) {
        html += template(item);
      } else {
        html += `
          <div class="activity-item" data-id="${item.id}">
            <div class="activity-dot ad-${item.color || 'turq'}">
              ${this.getSVGIcono(item.icono || '📌')}
            </div>
            <div class="activity-text">
              <div class="activity-title">${item.titulo}</div>
              <div class="activity-sub">${item.subtitulo || ''}</div>
            </div>
            <div class="activity-arrow">›</div>
          </div>
        `;
      }
    }

    html += '</div>';
    contenedor.innerHTML = html;
    return true;
  }

  /**
   * Renderizar categorías como botones
   */
  async renderizarCategorias(categorias, contenedor, opciones = {}) {
    if (!contenedor) return;

    const {
      activa = null,
      onclick = null
    } = opciones;

    let html = '';

    for (const cat of categorias) {
      const activa_clase = activa === cat.id ? 'active' : '';
      const clickHandler = onclick 
        ? `onclick="${onclick}('${cat.id}')"` 
        : `onclick="filtrarCategoria('${cat.id}')"`;

      html += `
        <button class="cat-btn ${activa_clase}" 
                data-categoria-id="${cat.id}"
                ${clickHandler}>
          <div class="cat-icon">${this.getSVGIcono(cat.icono || '📁')}</div>
          <span class="cat-name">${cat.nombre}</span>
        </button>
      `;
    }

    contenedor.innerHTML = html;
    return true;
  }

  /**
   * Cargar contenido dinámico de un módulo
   */
  async cargarContenido(moduloId, rutaJSON) {
    // Verificar caché
    if (this.contenidoEnCache.has(moduloId)) {
      console.log(`[MODULES] 📦 Contenido en caché: ${moduloId}`);
      return this.contenidoEnCache.get(moduloId);
    }

    // Evitar cargas duplicadas
    if (this.esperandoCarga.has(moduloId)) {
      return this.esperandoCarga.get(moduloId);
    }

    const promesa = this._cargarJSON(rutaJSON)
      .then(datos => {
        this.contenidoEnCache.set(moduloId, datos);
        this.esperandoCarga.delete(moduloId);
        console.log(`[MODULES] ✅ Contenido cargado: ${moduloId}`);
        return datos;
      })
      .catch(error => {
        console.error(`[MODULES] ❌ Error cargando ${moduloId}:`, error);
        this.esperandoCarga.delete(moduloId);
        throw error;
      });

    this.esperandoCarga.set(moduloId, promesa);
    return promesa;
  }

  /**
   * Cargar múltiples módulos en paralelo
   */
  async cargarMultiples(moduloIds, mapper) {
    const promesas = moduloIds.map(id => {
      const modulo = Config.getModulo(id);
      if (!modulo || !modulo.contenidoJSON) {
        return Promise.reject(new Error(`Módulo ${id} no tiene contenidoJSON`));
      }
      return this.cargarContenido(id, modulo.contenidoJSON);
    });

    try {
      const resultados = await Promise.all(promesas);
      console.log(`[MODULES] ✅ ${resultados.length} módulos cargados`);
      return resultados;
    } catch (error) {
      console.warn('[MODULES] ⚠️ Error en carga múltiple:', error);
      return [];
    }
  }

  /**
   * Limpiar caché de contenido
   */
  limpiarCache(moduloId = null) {
    if (moduloId) {
      this.contenidoEnCache.delete(moduloId);
      console.log(`[MODULES] 🗑️ Caché limpiado: ${moduloId}`);
    } else {
      this.contenidoEnCache.clear();
      console.log('[MODULES] 🗑️ Caché completamente limpiado');
    }
  }

  /**
   * Obtener información de un módulo formateada
   */
  getModuloInfo(moduloId) {
    const modulo = Config.getModulo(moduloId);
    if (!modulo) return null;

    return {
      ...modulo,
      contenidoEnCache: this.contenidoEnCache.has(moduloId),
      estado: this.esperandoCarga.has(moduloId) ? 'cargando' : 'listo'
    };
  }

  /**
   * Exportar estado para debugging
   */
  exportar() {
    return {
      modulosCargados: Array.from(this.contenidoEnCache.keys()),
      esperandoCarga: Array.from(this.esperandoCarga.keys()),
      tamanoCaché: this.contenidoEnCache.size
    };
  }

  // ──────────────────────────────────────────────
  // MÉTODOS PRIVADOS
  // ──────────────────────────────────────────────

  async _cargarJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }

  getSVGIcono(icono) {
    // Si ya es SVG, devolver como está
    if (typeof icono === 'string' && icono.includes('<svg')) {
      return icono;
    }

    // Mapeo de íconos a SVG
    const iconos = {
      '📚': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      '📖': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      '🌍': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 1 10 4M12 22a14.5 14.5 0 0 1-10-4"/><path d="M2 12h20"/></svg>',
      '🎭': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 11h.01"/><path d="M11 17h.01"/><path d="M16 16h.01"/><path d="M9 7h.01"/><circle cx="12" cy="12" r="9"/></svg>',
      '🗺️': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19.1 6.4 19.1 17.6 12 22 4.9 17.6 4.9 6.4 12 2"/><line x1="12" y1="12" x2="19.1" y2="6.4"/><polyline points="12 12 12 22 4.9 17.6"/><polyline points="12 12 4.9 6.4"/></svg>',
      '📁': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
      '📌': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="2"/><path d="M12 3v7"/><path d="M12 20v-3"/><path d="M3 12h7"/><path d="M16 12h5"/></svg>',
    };

    return iconos[icono] || iconos['📌'];
  }

  animar(elemento) {
    if (!elemento) return;
    const items = elemento.querySelectorAll('[data-animado="true"]');
    items.forEach((item, index) => {
      item.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
      item.style.opacity = '0';
    });
  }
}

// Instancia global
const Modules = new ModulesEngine();

// Inyectar animación en CSS si no existe
if (!document.querySelector('style[data-modules-anim]')) {
  const style = document.createElement('style');
  style.setAttribute('data-modules-anim', 'true');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}
