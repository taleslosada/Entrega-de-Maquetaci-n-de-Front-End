# Intervalo — Frontend Web

App de alarmas de descanso e hidratación para rutinas de gimnasio. Este repositorio contiene la
maquetación completa de las 9 pantallas de la aplicación web, como port fiel en HTML/CSS/JS puro
del prototipo de Figma Make de referencia.

NOTA: También hay una versión preliminar de las vistas de la app móvil al desplegar el portal, esa NO es la entrega móvil, solo es una versión que se uso anterior mente, la entrega móvil tiene su propio repositorio.

## Stack

- **HTML5 + CSS3 + JavaScript vanilla** — sin build step, sin dependencias que instalar, sin
  conexión a internet.
- **[Tailwind CSS](https://tailwindcss.com/) v4** — usado como generador de utilidades en tiempo de
  desarrollo; el CSS resultante ya está **compilado e incrustado** dentro de `index.html`.
- **Poppins** e **Inter** (Google Fonts) — incrustadas como `data:` URI (base64) directamente en el
  CSS de la página.

`index.html` es un **único archivo autocontenido**: HTML + CSS + JavaScript + tipografías, todo
incrustado. No hace ninguna petición externa ni a otros archivos del repositorio, así que funciona
igual sin importar cómo se abra: doble clic (`file://`), cualquier servidor estático
(`python -m http.server`, `npx serve`, Live Server, GitHub Pages, etc.), con o sin internet. Esto
evita por completo problemas de rutas relativas rotas por redirecciones de distintos servidores
(algunos, como `npx serve`, reescriben agresivamente las URLs de archivos `index.html`).

También se incluyen `app.js`, `styles.css` y `tailwind.css` **sueltos, solo como referencia de
lectura** (para revisar el código más cómodamente sin tener que buscar dentro del HTML incrustado)
— `index.html` no los carga; ya lleva su propia copia incrustada.

## Estructura

```
/
├── index.html      ← autocontenido (HTML+CSS+JS+fuentes), esto es lo que se abre/navega
├── app.js            copia de solo lectura, para revisar el código más fácil
├── styles.css        copia de solo lectura
└── tailwind.css      copia de solo lectura
```

Navegación real entre todas las pantallas manejada en JavaScript (sin recarga de página).

## Cómo ejecutar

No requiere instalación ni servidor: `index.html` es autocontenido.

1. **Abrir directamente**: doble clic en `index.html`.
2. **Servidor estático local** (el que se usó para corroborar de nuestra parte fue: `npx serve .`):
   `npx serve .` o `python3 -m http.server 8080`.

## Pantallas incluidas

Ancho de referencia **1024px** de contenido, layout fijo — no responsive: Login, Dashboard,
Historial, Estadísticas, Rutinas (con editor de rutina y biblioteca de ejercicios como
sub-pantallas), Asignar rutina, Comunidad, Cuenta.

## Interacción

Todos los componentes con algún nivel de interacción están activos: navegación entre pantallas,
toggles, pestañas/segmented controls, formularios (crear rutina, agregar ejercicio, asignar
rutina, editar ejercicio, cambiar gym buddy). Todo el estado vive en memoria del navegador
(JavaScript puro) — no hay backend ni persistencia real; al recargar la página, el estado vuelve a
sus valores iniciales.

## Origen y fidelidad visual

La maquetación replica 1:1 los colores, tipografía, espaciado y componentes del prototipo de
Figma Make construido a partir del Design System del proyecto:

| Token | Valor |
|---|---|
| Color primario | `#FF5A1F` |
| Navy / modo oscuro | `#12141A` |
| Éxito / hidratación | `#2FBF71` |
| Fondo | `#F4F5F7` |
| Texto principal | `#14161C` |
| Texto secundario | `#5B6472` |
| Borde | `#D8DDE3` |
| Tipografía de títulos y cifras | Poppins (600/700/800) |
| Tipografía de cuerpo | Inter (400/500/600) |

Los componentes (botones, inputs, cards, tabs, toggles) fueron construidos a medida con clases de
Tailwind, replicando exactamente los del prototipo de Figma Make de referencia.
