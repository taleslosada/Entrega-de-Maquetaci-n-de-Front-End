// ============================================================================
// Intervalo — App móvil (HTML/CSS/JS puro)
// Port fiel del prototipo de Figma Make (React + Tailwind) a vanilla JS.
// Dispositivo de referencia: ancho fijo 393px (equivalente iPhone 14/15).
// ============================================================================
(function () {
  "use strict";

  // ---------------------------------------------------------------- DATA ---
  const RUTINAS_INICIALES = [
    { nombre: "Pierna", ejercicios: [
      { nombre: "Sentadilla", series: 4, repeticiones: 12, descanso: 90 },
      { nombre: "Prensa de pierna", series: 4, repeticiones: 10, descanso: 90 },
      { nombre: "Extensión", series: 3, repeticiones: 15, descanso: 60 },
      { nombre: "Curl femoral", series: 3, repeticiones: 12, descanso: 60 },
    ]},
    { nombre: "Espalda y bíceps", ejercicios: [
      { nombre: "Jalón al pecho", series: 4, repeticiones: 12, descanso: 90 },
      { nombre: "Remo con barra", series: 4, repeticiones: 10, descanso: 90 },
      { nombre: "Curl con mancuerna", series: 3, repeticiones: 12, descanso: 60 },
      { nombre: "Curl martillo", series: 3, repeticiones: 12, descanso: 60 },
      { nombre: "Remo en polea", series: 4, repeticiones: 10, descanso: 90 },
    ]},
    { nombre: "Pecho y tríceps", ejercicios: [
      { nombre: "Press banca", series: 4, repeticiones: 10, descanso: 90 },
      { nombre: "Aperturas", series: 3, repeticiones: 12, descanso: 60 },
      { nombre: "Fondos", series: 3, repeticiones: 12, descanso: 60 },
      { nombre: "Press francés", series: 3, repeticiones: 12, descanso: 60 },
      { nombre: "Extensión polea", series: 3, repeticiones: 15, descanso: 45 },
    ]},
    { nombre: "Full body", ejercicios: [
      { nombre: "Sentadilla", series: 3, repeticiones: 12, descanso: 90 },
      { nombre: "Press banca", series: 3, repeticiones: 10, descanso: 90 },
      { nombre: "Peso muerto", series: 3, repeticiones: 8, descanso: 120 },
      { nombre: "Dominadas", series: 3, repeticiones: 8, descanso: 90 },
      { nombre: "Press militar", series: 3, repeticiones: 10, descanso: 90 },
      { nombre: "Plancha", series: 3, repeticiones: 60, descanso: 45 },
    ]},
  ];

  const REGISTROS_PESO = [
    { fecha: "12 ago", peso: 78.2 },
    { fecha: "10 ago", peso: 78.5 },
    { fecha: "07 ago", peso: 78.9 },
    { fecha: "05 ago", peso: 79.1 },
  ];

  // --------------------------------------------------------------- STATE ---
  const state = {
    screen: "login",
    prevScreen: "home",
    rutinas: clone(RUTINAS_INICIALES),
    rutinaActiva: clone(RUTINAS_INICIALES[0]),
    email: "",
    password: "",
    nuevaRutinaNombre: "",
    nuevaRutinaEjercicios: [{ nombre: "Sentadilla", series: 4, repeticiones: 12, descanso: 90 }],
    ejNombre: "", ejSeries: "", ejReps: "", ejDescanso: "",
    alarmaSegundos: 90,
    micEstado: "en espera", 
    timerActivo: false,
    segundosRestantes: 45,
    serieActual: 2,
    tabRecord: "Hidratación",
    recordActivado: true,
    frecuencia: "Cada 20 minutos",
    pesoHoy: "",
    pesosGuardados: clone(REGISTROS_PESO),
  };

  const TAB_SCREENS = ["home", "rutinas", "comunidad", "perfil"];
  const TAB_LABELS = ["Inicio", "Rutinas", "Comunidad", "Perfil"];

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  // ------------------------------------------------------------- ACTIONS ---
  let timerInterval = null;

  function navigate(to, from) {
    state.prevScreen = from || state.screen;
    state.screen = to;
    render();
  }

  function manageTimer() {
    const shouldRun = state.screen === "entrenamiento" && state.timerActivo && state.segundosRestantes > 0;
    if (shouldRun && !timerInterval) {
      timerInterval = setInterval(() => {
        state.segundosRestantes = Math.max(0, state.segundosRestantes - 1);
        render();
      }, 1000);
    } else if (!shouldRun && timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startEntrenamiento(rutina) {
    state.rutinaActiva = rutina;
    state.timerActivo = true;
    state.segundosRestantes = (rutina.ejercicios[0] && rutina.ejercicios[0].descanso) || 90;
    state.serieActual = 2;
    navigate("entrenamiento");
  }

  function formatTimer(s) {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  }

  function guardarEjercicio() {
    if (!state.ejNombre) return;
    state.nuevaRutinaEjercicios.push({
      nombre: state.ejNombre || "Ejercicio",
      series: parseInt(state.ejSeries) || 3,
      repeticiones: parseInt(state.ejReps) || 12,
      descanso: parseInt(state.ejDescanso) || 90,
    });
    state.ejNombre = ""; state.ejSeries = ""; state.ejReps = ""; state.ejDescanso = "";
    navigate("crear-rutina");
  }

  function guardarRutina() {
    if (!state.nuevaRutinaNombre) return;
    state.rutinas.unshift({ nombre: state.nuevaRutinaNombre, ejercicios: state.nuevaRutinaEjercicios });
    state.nuevaRutinaNombre = "";
    state.nuevaRutinaEjercicios = [];
    navigate("rutinas");
  }

  function guardarPeso() {
    if (!state.pesoHoy) return;
    const hoy = new Date();
    const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    const label = `${String(hoy.getDate()).padStart(2, "0")} ${meses[hoy.getMonth()]}`;
    state.pesosGuardados.unshift({ fecha: label, peso: parseFloat(state.pesoHoy) });
    state.pesoHoy = "";
    render();
  }

  function set(field, value) { state[field] = value; }

  function setAndRender(field, value) { state[field] = value; render(); }

  function ajustarAlarma(delta) {
    state.alarmaSegundos = Math.max(15, state.alarmaSegundos + delta);
    render();
  }

  function toggleMic() {
    state.micEstado = state.micEstado === "escuchando" ? "confirmado" : "escuchando";
    render();
  }

  function toggleRecordActivado() {
    state.recordActivado = !state.recordActivado;
    render();
  }

  function setTabRecord(tab) { state.tabRecord = tab; render(); }

  function saltarDescanso() {
    const nextSerie = state.serieActual + 1;
    const seriesObjetivo = (state.rutinaActiva.ejercicios[0] && state.rutinaActiva.ejercicios[0].series) || 4;
    if (nextSerie > seriesObjetivo) {
      state.timerActivo = false;
      navigate("resumen");
    } else {
      state.serieActual = nextSerie;
      state.segundosRestantes = (state.rutinaActiva.ejercicios[0] && state.rutinaActiva.ejercicios[0].descanso) || 90;
      render();
    }
  }

  function salirEntrenamiento() {
    state.timerActivo = false;
    navigate("resumen");
  }

  // Live-enable/disable a button without a full re-render (keeps input focus)
  function liveToggleDisabled(inputEl, btnId, value) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const disabled = !value;
    btn.disabled = disabled;
    btn.style.opacity = disabled ? "0.5" : "1";
    btn.style.background = disabled ? "#ccc" : "#FF5A1F";
  }

  window.App = {
    navigate, startEntrenamiento, guardarEjercicio, guardarRutina, guardarPeso,
    set, setAndRender, ajustarAlarma, toggleMic, toggleRecordActivado, setTabRecord,
    saltarDescanso, salirEntrenamiento, liveToggleDisabled,
  };

  // ---------------------------------------------------------- UI HELPERS ---
  function esc(s) { return String(s).replace(/'/g, "&#39;"); }

  function PhoneShell(inner) {
    return `<div class="flex items-start justify-center" style="min-height:100dvh;background:#0e1014;">
      <div class="relative flex flex-col overflow-hidden w-full" style="max-width:393px;min-height:100dvh;background:#F4F5F7;font-family:'Inter',sans-serif;">
        ${inner}
      </div>
    </div>`;
  }

  function TopBar(opts) {
    const { title, onBack, rightLabel, onRight } = opts;
    const left = onBack
      ? `<button onclick="${onBack}" class="text-lg font-semibold" style="color:#14161C;min-width:24px;">&lsaquo;</button>`
      : `<div style="min-width:24px;"></div>`;
    const right = rightLabel
      ? `<button onclick="${onRight}" class="text-sm font-medium" style="color:#FF5A1F;">${rightLabel}</button>`
      : `<div style="min-width:40px;"></div>`;
    return `<div class="flex items-center justify-between px-5 py-4 border-b" style="border-color:#E2E4E8;background:#fff;min-height:56px;">
      ${left}
      <span class="font-bold text-base" style="color:#14161C;font-family:'Poppins',sans-serif;">${title}</span>
      ${right}
    </div>`;
  }

  function TabBar() {
    return `<div class="flex border-t" style="border-color:#E2E4E8;background:#fff;">
      ${TAB_LABELS.map((label, i) => {
        const s = TAB_SCREENS[i];
        const active = state.screen === s;
        return `<button onclick="App.navigate('${s}')" class="flex-1 py-3 text-xs font-medium transition-colors" style="color:${active ? "#FF5A1F" : "#5B6472"};font-family:'Inter',sans-serif;border-top:${active ? "2px solid #FF5A1F" : "2px solid transparent"};">${label}</button>`;
      }).join("")}
    </div>`;
  }

  function Input(opts) {
    const { id, label, placeholder, value, field, type, liveBtnId } = opts;
    const labelHtml = label ? `<label class="text-xs font-medium" style="color:#5B6472;">${label}</label>` : "";
    const liveCall = liveBtnId ? `App.liveToggleDisabled(this,'${liveBtnId}',this.value);` : "";
    return `<div class="flex flex-col gap-1">
      ${labelHtml}
      <input id="${id}" type="${type || "text"}" placeholder="${placeholder || ""}" value="${esc(value || "")}"
        oninput="App.set('${field}', this.value); ${liveCall}"
        class="w-full px-3 py-2.5 rounded-lg border text-sm transition-colors"
        style="background:#fff;border:1.5px solid #E2E4E8;color:#14161C;font-family:'Inter',sans-serif;"
        onfocus="this.style.borderColor='#FF5A1F'" onblur="this.style.borderColor='#E2E4E8'">
    </div>`;
  }

  function BtnPrimary(opts) {
    const { id, label, onclick, disabled } = opts;
    return `<button id="${id || ""}" onclick="${onclick}" ${disabled ? "disabled" : ""}
      class="w-full py-3 rounded-2xl font-semibold text-sm transition-opacity"
      style="background:${disabled ? "#ccc" : "#FF5A1F"};color:#fff;font-family:'Poppins',sans-serif;opacity:${disabled ? "0.5" : "1"};">
      ${label}
    </button>`;
  }

  function BtnOutline(opts) {
    const { label, onclick } = opts;
    return `<button onclick="${onclick}"
      class="w-full py-3 rounded-2xl font-semibold text-sm border transition-colors"
      style="border:1.5px solid #14161C;color:#14161C;background:transparent;font-family:'Poppins',sans-serif;">
      ${label}
    </button>`;
  }

  function Divider(word) {
    return `<div class="flex items-center gap-3 w-full">
      <div class="flex-1 h-px" style="background:#E2E4E8;"></div>
      <span class="text-xs" style="color:#5B6472;">${word}</span>
      <div class="flex-1 h-px" style="background:#E2E4E8;"></div>
    </div>`;
  }

  // ------------------------------------------------------------- SCREENS ---
  function screenLogin() {
    const body = `
      <div class="flex flex-col flex-1 overflow-y-auto scrollbar-hide">
        <div class="flex-1 flex flex-col justify-center px-6 py-10 gap-6">
          <div class="text-center mb-2">
            <div class="text-4xl font-black mb-1" style="color:#14161C;font-family:'Poppins',sans-serif;">Intervalo</div>
            <div class="text-sm" style="color:#5B6472;">Alarmas de descanso e hidratación<br>para tu entrenamiento</div>
          </div>
          <button onclick="App.navigate('home')" class="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2" style="background:#14161C;color:#fff;font-family:'Poppins',sans-serif;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.121 17.64 11.834 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continuar con Google
          </button>
          ${Divider("o")}
          <div class="flex flex-col gap-3">
            ${Input({ id: "login-email", label: "Correo electrónico", placeholder: "camilo@correo.com", value: state.email, field: "email", type: "email" })}
            ${Input({ id: "login-pass", label: "Contraseña", placeholder: "••••••••", value: state.password, field: "password", type: "password" })}
          </div>
          ${BtnPrimary({ label: "Iniciar sesión", onclick: "App.navigate('home')" })}
          <button onclick="App.navigate('home')" class="text-center text-sm underline" style="color:#14161C;">¿No tienes cuenta? Regístrate</button>
        </div>
      </div>`;
    return PhoneShell(body);
  }

  function screenHome() {
    const body = `
      ${TopBar({ title: "Inicio" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-4">
        <div>
          <div class="text-xl font-bold" style="color:#14161C;font-family:'Poppins',sans-serif;">Hola, Camilo</div>
          <div class="text-sm" style="color:#5B6472;">¿Qué entrenamos hoy?</div>
        </div>
        <div class="rounded-xl p-4" style="background:#fff;border:1.5px solid #E2E4E8;">
          <div class="font-semibold text-sm mb-0.5" style="color:#14161C;font-family:'Poppins',sans-serif;">Rutina de hoy: Pierna</div>
          <div class="text-xs" style="color:#5B6472;">4 ejercicios · 52 min aprox.</div>
        </div>
        ${BtnPrimary({ label: "Iniciar entrenamiento", onclick: "App.startEntrenamiento(App.__rutinas[0])" })}
        <div>
          <div class="text-xs font-semibold mb-2 tracking-wide" style="color:#5B6472;">ACCESOS RÁPIDOS</div>
          <div class="flex flex-col gap-2">
            <button onclick="App.navigate('rutinas')" class="rounded-xl p-4 text-left flex items-center justify-between" style="background:#fff;border:1.5px solid #E2E4E8;">
              <div>
                <div class="font-semibold text-sm" style="color:#14161C;font-family:'Poppins',sans-serif;">Mis rutinas</div>
                <div class="text-xs" style="color:#5B6472;">${state.rutinas.length} rutinas guardadas</div>
              </div>
              <span style="color:#5B6472;">&rsaquo;</span>
            </button>
            <button onclick="App.navigate('recordatorios')" class="rounded-xl p-4 text-left flex items-center justify-between" style="background:#fff;border:1.5px solid #E2E4E8;">
              <div>
                <div class="font-semibold text-sm" style="color:#14161C;font-family:'Poppins',sans-serif;">Recordatorios</div>
                <div class="text-xs" style="color:#5B6472;">Hidratación cada 20 min</div>
              </div>
              <span style="color:#5B6472;">&rsaquo;</span>
            </button>
          </div>
        </div>
      </div>
      ${TabBar()}`;
    return PhoneShell(body);
  }

  function screenRutinas() {
    const rows = state.rutinas.map((r, i) => `
      <button onclick="App.startEntrenamiento(App.__rutinas[${i}])" class="py-3 flex items-center justify-between border-b text-left w-full" style="border-color:#E2E4E8;">
        <div>
          <div class="font-semibold text-sm" style="color:#14161C;font-family:'Poppins',sans-serif;">${r.nombre}</div>
          <div class="text-xs" style="color:#5B6472;">${r.ejercicios.length} ejercicios</div>
        </div>
        <span style="color:#5B6472;">&rsaquo;</span>
      </button>`).join("");
    const body = `
      ${TopBar({ title: "Rutinas" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="font-bold text-base" style="color:#14161C;font-family:'Poppins',sans-serif;">Mis rutinas</div>
          <button onclick="App.set('nuevaRutinaNombre',''); App.setAndRender('nuevaRutinaEjercicios', [])" class="text-xs px-3 py-1.5 rounded-full border font-semibold" style="border:1.5px solid #14161C;color:#14161C;">+ Nueva</button>
        </div>
        <div class="flex flex-col gap-0">${rows}</div>
      </div>
      ${TabBar()}`;
    return PhoneShell(body);
  }

  function screenCrearRutina() {
    const rows = state.nuevaRutinaEjercicios.map((ej) => `
      <button onclick="App.navigate('alarma-descanso')" class="w-full py-3 flex items-center justify-between border-b text-left" style="border-color:#E2E4E8;">
        <div>
          <div class="font-semibold text-sm" style="color:#14161C;font-family:'Poppins',sans-serif;">${ej.nombre}</div>
          <div class="text-xs" style="color:#5B6472;">${ej.series} series x ${ej.repeticiones} rep · ${ej.descanso}s descanso</div>
        </div>
        <span style="color:#5B6472;">&rsaquo;</span>
      </button>`).join("");
    const body = `
      ${TopBar({ title: "Crear rutina", onBack: "App.navigate('rutinas')", rightLabel: "Guardar", onRight: "App.guardarRutina()" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-4">
        ${Input({ id: "cr-nombre", label: "Nombre de la rutina", placeholder: "Ej. Pierna", value: state.nuevaRutinaNombre, field: "nuevaRutinaNombre", liveBtnId: "cr-guardar-btn" })}
        <div>
          <div class="text-xs font-semibold mb-2 tracking-wide" style="color:#5B6472;">EJERCICIOS</div>
          ${rows}
        </div>
        ${BtnOutline({ label: "+ Agregar ejercicio", onclick: "App.navigate('agregar-ejercicio')" })}
        ${BtnPrimary({ id: "cr-guardar-btn", label: "Guardar rutina", onclick: "App.guardarRutina()", disabled: !state.nuevaRutinaNombre })}
      </div>`;
    return PhoneShell(body);
  }

  function screenAgregarEjercicio() {
    const body = `
      ${TopBar({ title: "Agregar ejercicio", onBack: "App.navigate('crear-rutina')" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-4">
        ${Input({ id: "ae-nombre", label: "Nombre del ejercicio", placeholder: "Ej. Sentadilla", value: state.ejNombre, field: "ejNombre", liveBtnId: "ae-guardar-btn" })}
        ${Input({ id: "ae-series", label: "Series", placeholder: "Ej. 4", value: state.ejSeries, field: "ejSeries", type: "number" })}
        ${Input({ id: "ae-reps", label: "Repeticiones", placeholder: "Ej. 12", value: state.ejReps, field: "ejReps", type: "number" })}
        ${Input({ id: "ae-descanso", label: "Tiempo de descanso", placeholder: "Ej. 90 segundos", value: state.ejDescanso, field: "ejDescanso", type: "number" })}
        ${BtnPrimary({ id: "ae-guardar-btn", label: "Agregar a la rutina", onclick: "App.guardarEjercicio()", disabled: !state.ejNombre })}
      </div>`;
    return PhoneShell(body);
  }

  function screenAlarmaDescanso() {
    const escuchando = state.micEstado === "escuchando";
    const confirmado = state.micEstado === "confirmado";
    const estadoTexto = escuchando ? "escuchando..." : confirmado ? "¡Confirmado!" : "en espera";
    const micColor = escuchando ? "#FF5A1F" : "#5B6472";
    const body = `
      ${TopBar({ title: "Alarma de descanso entre series", onBack: "App.navigate('crear-rutina')" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-6 flex flex-col gap-5 items-center">
        <div class="text-sm text-center" style="color:#5B6472;">Configura cuánto descansas entre cada serie</div>
        <div class="text-center">
          <div class="font-black" style="font-size:64px;color:#14161C;font-family:'Poppins',sans-serif;line-height:1;">${state.alarmaSegundos} s</div>
          <div class="text-sm mt-1" style="color:#5B6472;">Tiempo de descanso</div>
        </div>
        <div class="flex gap-3 w-full">
          <button onclick="App.ajustarAlarma(-15)" class="flex-1 py-3 rounded-2xl border font-semibold text-sm" style="border:1.5px solid #14161C;color:#14161C;font-family:'Poppins',sans-serif;">&minus;15 s</button>
          <button onclick="App.ajustarAlarma(15)" class="flex-1 py-3 rounded-2xl border font-semibold text-sm" style="border:1.5px solid #14161C;color:#14161C;font-family:'Poppins',sans-serif;">+15 s</button>
        </div>
        ${Divider("o configura por voz")}
        <div class="flex flex-col items-center gap-2">
          <button onclick="App.toggleMic()" class="w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors" style="border:2px solid ${escuchando ? "#FF5A1F" : "#E2E4E8"};background:${escuchando ? "#FFF0EC" : "#fff"};">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="${micColor}"/>
              <path d="M5 10a7 7 0 0014 0" stroke="${micColor}" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="${micColor}" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="text-sm" style="color:#14161C;">Toca y habla</div>
          <div class="text-xs" style="color:#5B6472;">Di algo como: "Alarma de ${state.alarmaSegundos} segundos"</div>
          <div class="text-sm">
            <span class="font-semibold" style="color:#14161C;">Estado: </span>
            <span style="color:${confirmado ? "#2FBF71" : "#5B6472"};">${estadoTexto}</span>
          </div>
        </div>
        <div class="w-full">${BtnPrimary({ label: "Guardar alarma", onclick: "App.navigate('crear-rutina')" })}</div>
      </div>`;
    return PhoneShell(body);
  }

  function screenEntrenamiento() {
    manageTimer();
    const totalSeries = state.rutinaActiva.ejercicios.reduce((acc, e) => acc + e.series, 0);
    const seriesObjetivo = (state.rutinaActiva.ejercicios[0] && state.rutinaActiva.ejercicios[0].series) || 4;
    const ejercicioActual = (state.rutinaActiva.ejercicios[0] && state.rutinaActiva.ejercicios[0].nombre) || "Ejercicio";
    const siguiente = (state.rutinaActiva.ejercicios[1] && state.rutinaActiva.ejercicios[1].nombre) || "Finalizar";
    const body = `
      <div class="flex items-center justify-between px-5 py-4 border-b" style="border-color:#E2E4E8;background:#fff;">
        <span class="font-bold text-base" style="color:#14161C;font-family:'Poppins',sans-serif;">Entrenamiento</span>
        <button onclick="App.salirEntrenamiento()" class="text-sm font-medium" style="color:#FF5A1F;">Salir</button>
      </div>
      <div class="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div class="text-sm font-medium text-center" style="color:#5B6472;">${state.rutinaActiva.nombre} — Serie ${state.serieActual} de ${seriesObjetivo}</div>
        <div class="w-40 h-40 rounded-full flex items-center justify-center font-black" style="background:${state.segundosRestantes > 0 ? "#FF5A1F" : "#2FBF71"};color:#fff;font-size:42px;font-family:'Poppins',sans-serif;transition:background 0.5s;">
          ${formatTimer(state.segundosRestantes)}
        </div>
        <div class="text-center">
          <div class="font-semibold text-sm" style="color:#14161C;">Descanso restante</div>
          <div class="text-xs mt-0.5" style="color:#5B6472;">${ejercicioActual} completada. Descansa.</div>
        </div>
        <div class="w-full flex flex-col gap-3">${BtnOutline({ label: "Saltar descanso", onclick: "App.saltarDescanso()" })}</div>
        <div class="text-xs" style="color:#5B6472;">Siguiente: ${siguiente}</div>
      </div>`;
    return PhoneShell(body);
  }

  function screenRecordatorios() {
    const tabs = ["Hidratación", "Comida", "Preentreno/Proteína"];
    const horarios = {
      "Hidratación": [{ hora: "10:00 a.m.", tipo: "Hidratación" }, { hora: "10:20 a.m.", tipo: "Hidratación" }, { hora: "10:40 a.m.", tipo: "Hidratación" }],
      "Comida": [{ hora: "08:00 a.m.", tipo: "Desayuno" }, { hora: "01:00 p.m.", tipo: "Almuerzo" }, { hora: "07:00 p.m.", tipo: "Cena" }],
      "Preentreno/Proteína": [{ hora: "09:30 a.m.", tipo: "Preentreno" }, { hora: "12:00 p.m.", tipo: "Proteína" }],
    };
    const tabsHtml = tabs.map((t) => `
      <button onclick="App.setTabRecord('${t}')" class="flex-1 pb-2 text-xs font-semibold transition-colors" style="color:${state.tabRecord === t ? "#FF5A1F" : "#5B6472"};border-bottom:${state.tabRecord === t ? "2px solid #FF5A1F" : "2px solid transparent"};font-family:'Poppins',sans-serif;white-space:nowrap;font-size:0.65rem;">${t}</button>`).join("");
    const items = (horarios[state.tabRecord] || []).map((h) => `
      <div class="py-3 border-b" style="border-color:#E2E4E8;">
        <div class="font-medium text-sm" style="color:#14161C;">${h.hora}</div>
        <div class="text-xs" style="color:#5B6472;">${h.tipo}</div>
      </div>`).join("");
    const body = `
      ${TopBar({ title: "Recordatorios", onBack: "App.navigate('home')" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-4">
        <div class="flex border-b" style="border-color:#E2E4E8;">${tabsHtml}</div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium" style="color:#14161C;">Recordatorio activado</span>
          <button onclick="App.toggleRecordActivado()" class="w-12 h-6 rounded-full transition-colors flex items-center px-0.5" style="background:${state.recordActivado ? "#FF5A1F" : "#E2E4E8"};">
            <div class="w-5 h-5 rounded-full bg-white shadow transition-transform" style="transform:translateX(${state.recordActivado ? "24px" : "0"});"></div>
          </button>
        </div>
        <div>
          <label class="text-xs font-medium block mb-1" style="color:#5B6472;">Frecuencia</label>
          <input value="${esc(state.frecuencia)}" oninput="App.set('frecuencia', this.value)" class="w-full px-3 py-2.5 rounded-lg border text-sm" style="border:1.5px solid #E2E4E8;color:#14161C;background:#fff;" onfocus="this.style.borderColor='#FF5A1F'" onblur="this.style.borderColor='#E2E4E8'">
        </div>
        <div>
          <div class="text-xs font-semibold mb-2 tracking-wide" style="color:#5B6472;">HOY</div>
          ${items}
        </div>
        ${BtnOutline({ label: "+ Agregar recordatorio", onclick: "" })}
      </div>`;
    return PhoneShell(body);
  }

  function screenResumen() {
    const totalSeries = state.rutinaActiva.ejercicios.reduce((acc, e) => acc + e.series, 0);
    const stats = [
      { value: "52 min", label: "Duración" },
      { value: `${totalSeries}/${totalSeries}`, label: "Series" },
      { value: "100%", label: "Descansos" },
    ].map((s) => `
      <div class="flex-1 rounded-xl p-3 text-center border" style="background:#fff;border:1.5px solid #E2E4E8;">
        <div class="font-bold text-base" style="color:#14161C;font-family:'Poppins',sans-serif;">${s.value}</div>
        <div class="text-xs" style="color:#5B6472;">${s.label}</div>
      </div>`).join("");
    const body = `
      ${TopBar({ title: "Resumen" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-5">
        <div class="font-bold text-lg" style="color:#14161C;font-family:'Poppins',sans-serif;">Resumen del entrenamiento</div>
        <div class="flex gap-3">${stats}</div>
        <div class="flex flex-col gap-2">
          ${Input({ id: "peso-hoy", label: "Registrar peso de hoy (kg)", placeholder: "Ej. 78.2", value: state.pesoHoy, field: "pesoHoy", type: "number" })}
          ${BtnOutline({ label: "Guardar peso", onclick: "App.guardarPeso()" })}
        </div>
        <button onclick="App.navigate('historial-peso')" class="text-sm underline text-center" style="color:#14161C;">Ver historial de peso</button>
        ${BtnPrimary({ label: "Finalizar", onclick: "App.navigate('home')" })}
      </div>`;
    return PhoneShell(body);
  }

  function screenHistorialPeso() {
    const regs = state.pesosGuardados;
    const max = Math.max(...regs.map((r) => r.peso));
    const min = Math.min(...regs.map((r) => r.peso));
    const arr = regs.slice().reverse();
    let points = "";
    arr.forEach((r, i) => {
      const x = (i / (arr.length - 1 || 1)) * 280 + 10;
      const y = 70 - ((r.peso - min) / (max - min + 0.001)) * 60;
      if (i < arr.length - 1) {
        const x2 = ((i + 1) / (arr.length - 1 || 1)) * 280 + 10;
        const y2 = 70 - ((arr[i + 1].peso - min) / (max - min + 0.001)) * 60;
        points += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="#FF5A1F" stroke-width="2"/>`;
      }
      points += `<circle cx="${x}" cy="${y}" r="4" fill="#FF5A1F"/><text x="${x}" y="${y - 8}" text-anchor="middle" font-size="9" fill="#5B6472">${r.peso}</text>`;
    });
    const rows = regs.map((r) => `
      <div class="py-3 border-b" style="border-color:#E2E4E8;">
        <div class="font-semibold text-sm" style="color:#14161C;">${r.fecha}</div>
        <div class="text-xs" style="color:#5B6472;">${r.peso} kg</div>
      </div>`).join("");
    const body = `
      ${TopBar({ title: "Historial de peso", onBack: "App.navigate('resumen')" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-4">
        <div class="rounded-xl p-4" style="background:#fff;border:1.5px solid #E2E4E8;">
          <div class="text-xs font-semibold mb-3" style="color:#5B6472;">Evolución de peso (kg)</div>
          <svg width="100%" height="80" viewBox="0 0 300 80">${points}</svg>
        </div>
        <div>
          <div class="text-xs font-semibold mb-2 tracking-wide" style="color:#5B6472;">REGISTROS</div>
          ${rows}
        </div>
      </div>`;
    return PhoneShell(body);
  }

  function screenPerfil() {
    const items = [
      { label: "Mis rutinas", to: "rutinas" },
      { label: "Historial de peso", to: "historial-peso" },
      { label: "Dispositivos vinculados", to: "dispositivos" },
      { label: "Comunidad / Gym buddy", to: "comunidad" },
    ].map((it) => `
      <button onclick="App.navigate('${it.to}')" class="py-4 flex items-center justify-between border-b text-left w-full" style="border-color:#E2E4E8;">
        <span class="text-sm font-medium" style="color:#14161C;">${it.label}</span>
        <span style="color:#5B6472;">&rsaquo;</span>
      </button>`).join("");
    const body = `
      ${TopBar({ title: "Perfil" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg" style="background:#FF5A1F;color:#fff;font-family:'Poppins',sans-serif;">CP</div>
          <div>
            <div class="font-bold text-base" style="color:#14161C;font-family:'Poppins',sans-serif;">Camilo Perdomo</div>
            <div class="text-xs" style="color:#5B6472;">camilo@correo.com</div>
          </div>
        </div>
        <div class="flex flex-col">
          ${items}
          <button onclick="App.navigate('login')" class="py-4 text-left text-sm font-medium border-b" style="border-color:#E2E4E8;color:#FF5A1F;">Cerrar sesión</button>
        </div>
      </div>
      ${TabBar()}`;
    return PhoneShell(body);
  }

  function screenComunidad() {
    const shares = ["Compartir a WhatsApp", "Compartir a Instagram", "Compartir a Strava"].map((item) => `
      <button class="w-full py-4 text-left text-sm border-b" style="border-color:#E2E4E8;color:#14161C;">${item}</button>`).join("");
    const body = `
      ${TopBar({ title: "Comunidad" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-4">
        <div class="rounded-xl p-4" style="background:#fff;border:1.5px solid #E2E4E8;">
          <div class="font-semibold text-sm mb-0.5" style="color:#14161C;font-family:'Poppins',sans-serif;">Tu gym buddy: Andrés G.</div>
          <div class="text-xs" style="color:#5B6472;">Entrena contigo 3 veces por semana</div>
        </div>
        ${BtnOutline({ label: "Cambiar gym buddy", onclick: "" })}
        ${BtnOutline({ label: "Invitar a un compañero", onclick: "" })}
        <div>
          <div class="text-xs font-semibold mb-2 tracking-wide" style="color:#5B6472;">COMPARTIR TU RESUMEN</div>
          ${shares}
        </div>
      </div>
      ${TabBar()}`;
    return PhoneShell(body);
  }

  function screenDispositivos() {
    const body = `
      ${TopBar({ title: "Dispositivos vinculados", onBack: "App.navigate('perfil')" })}
      <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-4">
        <div class="rounded-xl p-4" style="background:#fff;border:1.5px solid #E2E4E8;">
          <div class="font-semibold text-sm" style="color:#14161C;font-family:'Poppins',sans-serif;">Reloj: Galaxy Watch 5</div>
          <div class="text-xs mt-0.5" style="color:#2FBF71;">Estado: Conectado</div>
        </div>
        ${BtnOutline({ label: "Desvincular", onclick: "" })}
        ${BtnOutline({ label: "+ Vincular nuevo dispositivo", onclick: "" })}
        <div class="text-xs" style="color:#5B6472;">Necesario para recibir alarmas por vibración durante el entrenamiento.</div>
      </div>`;
    return PhoneShell(body);
  }

  // ------------------------------------------------------------- RENDER ---
  const SCREENS = {
    "login": screenLogin,
    "home": screenHome,
    "rutinas": screenRutinas,
    "crear-rutina": screenCrearRutina,
    "agregar-ejercicio": screenAgregarEjercicio,
    "alarma-descanso": screenAlarmaDescanso,
    "entrenamiento": screenEntrenamiento,
    "recordatorios": screenRecordatorios,
    "resumen": screenResumen,
    "historial-peso": screenHistorialPeso,
    "perfil": screenPerfil,
    "comunidad": screenComunidad,
    "dispositivos": screenDispositivos,
  };

  function render() {
    App.__rutinas = state.rutinas; // expose for inline handlers referencing App.__rutinas[i]
    const fn = SCREENS[state.screen] || screenLogin;
    document.getElementById("app").innerHTML = fn();
    if (state.screen !== "entrenamiento") manageTimer();
  }

  document.addEventListener("DOMContentLoaded", render);
})();
