/**
 * ═══════════════════════════════════════════════════════════════
 *  EJEMPLOS DE USO - Sistema de Módulos Dinámicos
 *  CPEM N° 99 — v1.0
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// EJEMPLO 1: Esperar a que se cargue la configuración
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 1: Carga de Configuración ───');

// Opción A: Usar observador
Config.suscribirse((evento, datos) => {
  if (evento === 'config-cargada') {
    console.log('✅ Configuración cargada en el app');
    console.log('📊 Total de módulos:', Config.getModulos().length);
  }
});

// Opción B: Esperar manualmente
async function ejemplo1() {
  let intentos = 0;
  while (!Config.cargado && intentos < 10) {
    await new Promise(r => setTimeout(r, 100));
    intentos++;
  }
  
  if (Config.cargado) {
    console.log('✅ Configuración lista');
  }
}


// ─────────────────────────────────────────────────────────────
// EJEMPLO 2: Obtener y mostrar todos los módulos
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 2: Listar Módulos ───');

function ejemplo2() {
  const modulos = Config.getModulosOrdenados();
  
  modulos.forEach((modulo, index) => {
    console.log(`${index + 1}. ${modulo.titulo}`);
    console.log(`   ID: ${modulo.id}`);
    console.log(`   Color: ${modulo.color}`);
    console.log(`   Estado: ${modulo.estado}`);
    console.log(`   Prioridad: ${modulo.prioridad}`);
  });
}

// ejemplo2(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 3: Obtener un módulo específico
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 3: Obtener Módulo Específico ───');

function ejemplo3() {
  const modulo = Config.getModulo('diccionario');
  
  if (modulo) {
    console.log('📚 Módulo encontrado:');
    console.log('Título:', modulo.titulo);
    console.log('Descripción:', modulo.descripcion);
    console.log('Ruta:', modulo.ruta);
    console.log('¿Tiene audios?', modulo.audiosDisponibles);
  }
}

// ejemplo3(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 4: Filtrar módulos
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 4: Filtrar Módulos ───');

function ejemplo4() {
  console.log('Módulos activos:');
  Config.getModulosPor({ estado: 'activo' }).forEach(m => {
    console.log(`  - ${m.titulo}`);
  });
  
  console.log('\nMódulos de color turquesa:');
  Config.getModulosPor({ color: 'turq' }).forEach(m => {
    console.log(`  - ${m.titulo}`);
  });
  
  console.log('\nMódulos para estudiantes:');
  Config.getModulosPor({ audiencia: 'estudiantes' }).forEach(m => {
    console.log(`  - ${m.titulo}`);
  });
}

// ejemplo4(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 5: Trabajar con categorías
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 5: Categorías ───');

function ejemplo5() {
  const categorias = Config.getCategorias();
  
  console.log('Categorías disponibles:');
  categorias.forEach(cat => {
    const modulos = Config.getModulosDeCategoria(cat.id);
    console.log(`\n📁 ${cat.nombre}`);
    console.log(`   Descripción: ${cat.descripcion}`);
    console.log(`   Módulos (${modulos.length}):`);
    modulos.forEach(m => {
      console.log(`     - ${m.titulo}`);
    });
  });
}

// ejemplo5(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 6: Renderizar módulos en un contenedor
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 6: Renderizar Grid de Módulos ───');

async function ejemplo6() {
  // Crear contenedor para demostración
  const contenedor = document.createElement('div');
  contenedor.id = 'demo-modulos';
  
  // Obtener módulos
  const modulos = Config.getModulosOrdenados();
  
  // Renderizar
  await Modules.renderizarGrid(modulos, contenedor, {
    clase: 'modules-grid',
    onclick: (id) => {
      console.log(`Clickeaste en módulo: ${id}`);
      const modulo = Config.getModulo(id);
      console.log(`Navegando a: ${modulo.ruta}`);
    },
    mostrarBadge: true,
    animarEntrada: true
  });
  
  console.log('✅ Grid renderizado');
  // document.body.appendChild(contenedor);
}

// ejemplo6(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 7: Cargar contenido de un módulo
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 7: Cargar Contenido Dinámico ───');

async function ejemplo7() {
  try {
    // Cargar diccionario
    const diccionario = await Modules.cargarContenido(
      'diccionario',
      '/CPEM-99/contenido/diccionario.json'
    );
    
    console.log('✅ Diccionario cargado');
    console.log('Categorías:', diccionario.categorias.length);
    
    diccionario.categorias.forEach(cat => {
      console.log(`  📌 ${cat.nombre}: ${cat.palabras.length} palabras`);
    });
  } catch (error) {
    console.error('❌ Error cargando contenido:', error);
  }
}

// ejemplo7(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 8: Cargar múltiples módulos en paralelo
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 8: Carga Paralela ───');

async function ejemplo8() {
  try {
    const inicio = performance.now();
    
    // Cargar varios módulos simultáneamente
    const contenidos = await Modules.cargarMultiples(['diccionario']);
    
    const tiempo = performance.now() - inicio;
    
    console.log(`✅ ${contenidos.length} módulos cargados en ${tiempo.toFixed(2)}ms`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ejemplo8(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 9: Renderizar lista de actividades
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 9: Renderizar Lista ───');

async function ejemplo9() {
  const contenedor = document.createElement('div');
  contenedor.id = 'demo-lista';
  
  const items = [
    {
      id: 1,
      titulo: 'La esquila: práctica ancestral',
      subtitulo: 'Ciencias Sociales · 15 min',
      color: 'red',
      icono: '📄'
    },
    {
      id: 2,
      titulo: 'Pronunciación Mapuzugún',
      subtitulo: 'Lengua · 8 min',
      color: 'turq',
      icono: '🎵'
    },
    {
      id: 3,
      titulo: 'Mapa de Paso Aguerre',
      subtitulo: 'Territorio · Interactivo',
      color: 'ocre',
      icono: '🗺️'
    }
  ];
  
  await Modules.renderizarLista(items, contenedor);
  
  console.log('✅ Lista renderizada');
  // document.body.appendChild(contenedor);
}

// ejemplo9(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 10: Renderizar categorías
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 10: Renderizar Categorías ───');

async function ejemplo10() {
  const contenedor = document.createElement('div');
  contenedor.id = 'demo-categorias';
  
  const categorias = Config.getCategorias();
  
  await Modules.renderizarCategorias(categorias, contenedor, {
    activa: 'lenguaje',
    onclick: (id) => {
      console.log(`Filtrar por categoría: ${id}`);
    }
  });
  
  console.log('✅ Categorías renderizadas');
  // document.body.appendChild(contenedor);
}

// ejemplo10(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 11: Validar configuración
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 11: Validar Configuración ───');

function ejemplo11() {
  if (Config.validar()) {
    console.log('✅ Configuración válida');
    console.log('Total de módulos:', Config.getModulos().length);
    console.log('Total de categorías:', Config.getCategorias().length);
  } else {
    console.error('❌ Hay errores en la configuración');
  }
}

// ejemplo11(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// EJEMPLO 12: Depuración completa
// ─────────────────────────────────────────────────────────────

console.log('─── EJEMPLO 12: Estado Completo ───');

function ejemplo12() {
  console.log('📊 ESTADO DEL SISTEMA');
  console.log('═════════════════════════════════════');
  
  console.log('\n🔧 Configuración:');
  const configState = Config.exportar();
  console.table({
    'Versión': configState.version,
    'Cargado': configState.cargado,
    'Módulos': configState.modulos.length,
    'Categorías': configState.categorias.length
  });
  
  console.log('\n📦 Módulos:');
  console.table(configState.modulos.map(m => ({
    ID: m.id,
    Título: m.titulo,
    Color: m.color,
    Estado: m.estado,
    Prioridad: m.prioridad
  })));
  
  console.log('\n💾 Motor de Módulos:');
  const modulesState = Modules.exportar();
  console.table(modulesState);
  
  console.log('\n✅ Validación:');
  const esValido = Config.validar();
  console.log('Estado:', esValido ? '✅ OK' : '❌ ERROR');
}

// ejemplo12(); // Descomentar para ejecutar


// ─────────────────────────────────────────────────────────────
// UTILIDAD: Ejecutar todos los ejemplos
// ─────────────────────────────────────────────────────────────

console.log('\n💡 CONSEJOS');
console.log('═════════════════════════════════════');
console.log('Para ejecutar un ejemplo, descomentar la línea con:');
console.log('  // ejemplo1(); <- Cambiar a: ejemplo1();');
console.log('\nPara depuración rápida, ejecutar en consola:');
console.log('  console.log(Config.exportar())');
console.log('  console.log(Modules.exportar())');
console.log('  Config.validar()');
console.log('═════════════════════════════════════');
