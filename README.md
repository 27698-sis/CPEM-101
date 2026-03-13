# CPEM N° 99 — Paso Aguerre · PWA Intercultural

Aplicación educativa intercultural para estudiantes de comunidades mapuches.
Funciona **completamente sin internet** una vez instalada.

---

## Estructura de archivos

```
cpem101-pwa/
├── index.html          ← App principal (splash + home)
├── manifest.json       ← Hace que la app sea instalable
├── sw.js               ← Service Worker (gestiona el offline)
├── icons/
│   ├── icon-192.png    ← Ícono app (192×192 px)
│   └── icon-512.png    ← Ícono app (512×512 px)
└── contenido/          ← Carpeta para agregar materiales
    ├── modulos.json
    └── ...
```

---

## Publicar en GitHub Pages — paso a paso

### 1. Crear cuenta en GitHub
- Entrá a https://github.com
- Hacé clic en **Sign up**
- Usá un correo del colegio, ej: `cpem99pague@gmail.com`
- Elegí un nombre de usuario, ej: `cpem99-pague`

### 2. Crear el repositorio
- Hacé clic en el botón verde **New** (o el ícono +)
- **Repository name:** `app` (la URL quedará: `cpem101-pague.github.io/app`)
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

## Actualizar contenido

Cada vez que querés agregar o modificar algo:

1. Entrá a github.com con tu cuenta
2. Abrí el repositorio `app`
3. Hacé clic en el archivo que querés editar (ej: `index.html`)
4. Hacé clic en el ícono del lápiz (Edit this file)
5. Hacés los cambios
6. Abajo, en **Commit changes**, escribís qué cambiaste
7. Hacés clic en **Commit changes**

→ En menos de 2 minutos, el cambio está vivo.
→ La próxima vez que los estudiantes abran la app con señal, se actualiza sola.

---

## Íconos necesarios

Necesitás crear la carpeta `icons/` y agregar:
- `icon-192.png` — 192×192 píxeles
- `icon-512.png` — 512×512 píxeles

Podés generarlos gratis en: https://realfavicongenerator.net

---

## Versión actual
- v1.0.0 — Splash screen + Home screen
