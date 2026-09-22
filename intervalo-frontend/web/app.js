// ============================================================================
// Intervalo — App web (HTML/CSS/JS puro)
// Port fiel del prototipo de Figma Make (React + Tailwind) a vanilla JS.
// ============================================================================
(function () {
  "use strict";

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function esc(s) { return String(s == null ? "" : s).replace(/"/g, "&quot;"); }
  function fmtDate(d) {
    const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${String(d.getDate()).padStart(2, "0")} ${meses[d.getMonth()]}`;
  }

  // --------------------------------------------------------------- STATE ---
  const state = {
    page: "login",
    email: "camilo@correo.com",
    password: "••••••••",
    loginError: "",

    racha: 5,
    entrenamientos: 12,
    peso: 78.2,
    historial: [
      { fecha: "12 ago", rutina: "Pierna", duracion: 52, cumplimiento: 100 },
      { fecha: "10 ago", rutina: "Espalda y bíceps", duracion: 48, cumplimiento: 90 },
      { fecha: "08 ago", rutina: "Pecho y tríceps", duracion: 55, cumplimiento: 100 },
      { fecha: "05 ago", rutina: "Full body", duracion: 61, cumplimiento: 95 },
      { fecha: "03 ago", rutina: "Pierna", duracion: 50, cumplimiento: 100 },
    ],

    rutinas: [
      { nombre: "Pierna", ejercicios: [
        { nombre: "Sentadilla", series: 4, reps: 12, descanso: 90 },
        { nombre: "Prensa de pierna", series: 4, reps: 15, descanso: 60 },
      ], ultimaEdicion: "12 ago" },
      { nombre: "Espalda y bíceps", ejercicios: [
        { nombre: "Dominadas", series: 4, reps: 8, descanso: 90 },
        { nombre: "Curl de bíceps", series: 3, reps: 12, descanso: 60 },
      ], ultimaEdicion: "09 ago" },
      { nombre: "Pecho y tríceps", ejercicios: [
        { nombre: "Press banca", series: 4, reps: 10, descanso: 90 },
        { nombre: "Fondos", series: 3, reps: 12, descanso: 60 },
      ], ultimaEdicion: "07 ago" },
      { nombre: "Full body", ejercicios: [
        { nombre: "Peso muerto", series: 4, reps: 6, descanso: 120 },
        { nombre: "Press militar", series: 3, reps: 10, descanso: 90 },
        { nombre: "Sentadilla", series: 3, reps: 12, descanso: 90 },
      ], ultimaEdicion: "01 ago" },
    ],
    selectedRutina: 0,
    editingEj: null,
    newRutinaName: "",
    showNewRutinaForm: false,

    busqueda: "",

    asignarUsuario: "Camilo Perdomo",
    asignarRutina: "Pierna",
    asignaciones: [
      { usuario: "Camilo Perdomo", rutina: "Pierna", fecha: "01 ago" },
      { usuario: "Camilo Perdomo", rutina: "Full body", fecha: "15 jul" },
    ],

    periodo: "30d",

    gymBuddy: "Andrés G.",
    showChangeBuddy: false,
    newBuddy: "",

    nombre: "Camilo Perdomo",
    correo: "camilo@correo.com",
    cuentaPassword: "••••••••",
    notifPush: true,
    notifEmail: false,
    savedCuenta: false,
  };

  const EJERCICIOS_BIBLIOTECA = [
    { nombre: "Sentadilla", grupo: "Pierna" },
    { nombre: "Peso muerto", grupo: "Espalda / Pierna" },
    { nombre: "Press banca", grupo: "Pecho" },
    { nombre: "Dominadas", grupo: "Espalda" },
    { nombre: "Curl de bíceps", grupo: "Bíceps" },
    { nombre: "Press militar", grupo: "Hombro" },
    { nombre: "Fondos", grupo: "Tríceps" },
    { nombre: "Prensa de pierna", grupo: "Pierna" },
    { nombre: "Remo con barra", grupo: "Espalda" },
    { nombre: "Aperturas pecho", grupo: "Pecho" },
  ];

  const PESO_DATA = {
    "7d": [79.1, 78.8, 78.7, 78.5, 78.4, 78.3, 78.2],
    "30d": [80.1, 79.5, 79.0, 78.8, 78.5, 78.3, 78.2, 78.0],
    "3m": [82, 81, 80.5, 80, 79.5, 79, 78.5, 78.2],
    "6m": [85, 83, 81, 80, 79, 78.5, 78.2],
    "1a": [88, 85, 83, 81, 80, 79, 78.5, 78.2],
  };
  const DESCANSO_DATA = {
    "7d": [85, 90, 88, 92, 87, 95, 91],
    "30d": [80, 83, 87, 90, 88, 92, 91, 93],
    "3m": [75, 80, 83, 87, 89, 91, 93],
    "6m": [70, 75, 80, 85, 88, 91, 93],
    "1a": [65, 72, 78, 82, 86, 89, 92, 93],
  };
  const HIDRATACION_DATA = {
    "7d": [60, 72, 68, 80, 75, 82, 78],
    "30d": [55, 60, 65, 70, 72, 75, 78, 80],
    "3m": [50, 57, 63, 68, 72, 76, 80],
    "6m": [45, 53, 60, 66, 71, 76, 80],
    "1a": [40, 50, 58, 65, 70, 75, 79, 80],
  };

  // ------------------------------------------------------------- ACTIONS ---
  function navigate(p) { state.page = p; render(); }
  function navToRutinas(sub) { state.page = sub; render(); }
  function set(field, value) { state[field] = value; }
  function setAndRender(field, value) { state[field] = value; render(); }

  function handleLogin() {
    if (!state.email || !state.password) { state.loginError = "Completa todos los campos."; render(); return; }
    navigate("dashboard");
  }

  function addRutina() {
    if (!state.newRutinaName.trim()) return;
    state.rutinas.push({ nombre: state.newRutinaName.trim(), ejercicios: [], ultimaEdicion: fmtDate(new Date()) });
    state.selectedRutina = state.rutinas.length - 1;
    state.newRutinaName = "";
    state.showNewRutinaForm = false;
    render();
  }

  function deleteRutina(i) {
    state.rutinas.splice(i, 1);
    state.selectedRutina = null;
    render();
  }

  function addEjercicio(nombre) {
    if (state.selectedRutina === null) return;
    state.rutinas[state.selectedRutina].ejercicios.push({ nombre, series: 3, reps: 10, descanso: 60 });
    state.rutinas[state.selectedRutina].ultimaEdicion = fmtDate(new Date());
  }

  function removeEjercicio(rutIdx, ejIdx) {
    state.rutinas[rutIdx].ejercicios.splice(ejIdx, 1);
    render();
  }

  function updateEjercicio(rutIdx, ejIdx, field, value) {
    const ej = state.rutinas[rutIdx].ejercicios[ejIdx];
    ej[field] = (field === "nombre") ? value : Number(value);
  }

  function handleAsignar() {
    if (!state.asignarUsuario || !state.asignarRutina) return;
    state.asignaciones.push({ usuario: state.asignarUsuario, rutina: state.asignarRutina, fecha: fmtDate(new Date()) });
    render();
  }

  function saveCuenta() {
    state.savedCuenta = true;
    render();
    setTimeout(() => { state.savedCuenta = false; render(); }, 2000);
  }

  function renderBibliotecaResults() {
    const el = document.getElementById("biblioteca-results");
    if (el) el.outerHTML = bibliotecaResultsTable();
  }

  window.App = {
    navigate, navToRutinas, set, setAndRender, handleLogin,
    addRutina, deleteRutina, addEjercicio, removeEjercicio, updateEjercicio,
    handleAsignar, saveCuenta, renderBibliotecaResults,
  };

  // ---------------------------------------------------------- UI HELPERS ---
  const inputCls = "w-full border border-[#D8DDE3] rounded-lg px-3 py-2 text-sm font-[Inter] text-[#14161C] bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-colors placeholder:text-[#5B6472]";
  const btnPrimary = "w-full bg-[#FF5A1F] text-white font-[Poppins] font-bold text-sm py-2.5 px-4 rounded-full hover:bg-[#e04d17] active:scale-[0.98] transition-all cursor-pointer";
  const btnOutline = "border border-[#14161C] text-[#14161C] font-[Poppins] font-bold text-sm py-2.5 px-4 rounded-full hover:bg-[#14161C] hover:text-white transition-all cursor-pointer";
  const labelCls = "block text-xs font-[Inter] font-medium text-[#5B6472] mb-1";

  function Shell(children) {
    const navItems = [["dashboard","Dashboard"],["rutinas","Rutinas"],["historial","Historial"],["estadisticas","Estadísticas"],["comunidad","Comunidad"],["cuenta","Cuenta"]];
    const activeTab = ["dashboard","historial","estadisticas","rutinas","comunidad","cuenta"].includes(state.page) ? state.page : "rutinas";
    const nav = navItems.map(([p, label]) => {
      const active = activeTab === p;
      const cls = active
        ? "font-semibold text-[#14161C] border-b-2 border-[#FF5A1F] rounded-none"
        : "text-[#5B6472] hover:text-[#14161C]";
      const target = p === "rutinas" ? "rutinas" : p;
      return `<button onclick="App.navToRutinas('${target}')" class="px-3 py-1.5 text-sm font-[Inter] rounded-md transition-colors cursor-pointer ${cls}">${label}</button>`;
    }).join("");
    return `<div class="min-h-screen bg-[#F4F5F7] font-[Inter]">
      <header class="bg-white border-b border-[#D8DDE3] px-6 py-3 flex items-center gap-3">
        <span class="font-[Poppins] font-extrabold text-lg text-[#14161C] tracking-tight">Intervalo</span>
        <nav class="flex gap-1 ml-4">${nav}</nav>
        <button onclick="App.navigate('login')" class="ml-auto text-xs text-[#5B6472] hover:text-[#FF5A1F] transition-colors cursor-pointer">Cerrar sesión</button>
      </header>
      <main class="max-w-3xl mx-auto px-4 py-6">${children}</main>
    </div>`;
  }

  function Card(inner, extraCls) {
    return `<div class="bg-white border border-[#D8DDE3] rounded-xl p-4 ${extraCls || ""}">${inner}</div>`;
  }

  function SectionTitle(text) {
    return `<h1 class="font-[Poppins] font-bold text-xl text-[#14161C] mb-1">${text}</h1>`;
  }

  function Toggle(label, field, value) {
    return `<div class="flex items-center justify-between">
      <span class="text-sm text-[#14161C]">${label}</span>
      <button type="button" role="switch" aria-checked="${value}" onclick="App.setAndRender('${field}', ${!value})"
        class="relative w-10 h-6 rounded-full transition-colors cursor-pointer ${value ? "bg-[#14161C]" : "bg-[#D8DDE3]"}">
        <span class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-1"}"></span>
      </button>
    </div>`;
  }

  function MiniLineChart(data, color) {
    const w = 220, h = 64;
    const min = Math.min(...data), max = Math.max(...data);
    const range = (max - min) || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return [x, y];
    });
    const ptsStr = pts.map((p) => p.join(",")).join(" ");
    const last = pts[pts.length - 1];
    return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="overflow:visible;">
      <polyline points="${ptsStr}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${last[0]}" cy="${last[1]}" r="3" fill="${color}"/>
    </svg>`;
  }

  // ------------------------------------------------------------- SCREENS ---
  function screenLogin() {
    return `<div class="min-h-screen bg-[#F4F5F7] flex items-center justify-center font-[Inter]">
      <div class="bg-white border border-[#D8DDE3] rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 class="font-[Poppins] font-extrabold text-3xl text-[#14161C] text-center mb-1">Intervalo</h1>
        <p class="text-xs text-[#5B6472] text-center mb-6">Alarmas de descanso e hidratación para tu entrenamiento</p>
        <button onclick="App.navigate('dashboard')" class="${btnPrimary} mb-4">Continuar con Google</button>
        <div class="flex items-center gap-3 mb-4">
          <div class="flex-1 h-px bg-[#D8DDE3]"></div><span class="text-xs text-[#5B6472]">o</span><div class="flex-1 h-px bg-[#D8DDE3]"></div>
        </div>
        <div class="flex flex-col gap-3">
          <div>
            <label class="${labelCls}">Correo electrónico</label>
            <input type="email" value="${esc(state.email)}" oninput="App.set('email', this.value)" placeholder="camilo@correo.com" class="${inputCls}">
          </div>
          <div>
            <label class="${labelCls}">Contraseña</label>
            <input type="password" value="" oninput="App.set('password', this.value)" placeholder="Contraseña" class="${inputCls}">
          </div>
          ${state.loginError ? `<p class="text-xs text-[#FF5A1F]">${state.loginError}</p>` : ""}
          <button onclick="App.handleLogin()" class="${btnPrimary} mt-1">Iniciar sesión</button>
        </div>
      </div>
    </div>`;
  }

  function screenDashboard() {
    const rows = state.historial.slice(0, 3).map((r) => `
      <tr class="border-b border-[#F4F5F7] last:border-0">
        <td class="py-2 pr-4 text-[#5B6472]">${r.fecha}</td>
        <td class="py-2 pr-4 text-[#14161C]">${r.rutina}</td>
        <td class="py-2 pr-4 text-[#14161C]">${r.duracion} min</td>
        <td class="py-2 pr-4"><span class="font-semibold ${r.cumplimiento === 100 ? "text-[#2FBF71]" : "text-[#FF5A1F]"}">${r.cumplimiento}%</span></td>
      </tr>`).join("");
    const stats = [
      { val: `${state.racha} días`, label: "Racha actual" },
      { val: state.entrenamientos, label: "Entrenamientos este mes" },
      { val: `${state.peso} kg`, label: "Peso actual" },
    ].map((s) => Card(`<p class="font-[Poppins] font-extrabold text-2xl text-[#14161C]">${s.val}</p><p class="text-xs text-[#5B6472] mt-0.5">${s.label}</p>`, "text-center")).join("");
    const inner = `
      ${Card(`<p class="font-[Poppins] font-bold text-base text-[#14161C] mb-2">Hoy te toca: Pierna — lunes</p>
        <button onclick="App.navigate('rutinas')" class="w-full border border-[#14161C] rounded-full py-2 text-sm font-[Poppins] font-bold text-[#14161C] hover:bg-[#14161C] hover:text-white transition-all cursor-pointer">Ver rutina</button>`, "mb-4")}
      <div class="grid grid-cols-3 gap-3 mb-4">${stats}</div>
      ${Card(`<p class="text-xs font-semibold tracking-widest text-[#5B6472] uppercase mb-3">Actividad reciente</p>
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[#D8DDE3]">
            ${["Fecha","Rutina","Duración","Cumplimiento"].map((h) => `<th class="text-left text-xs font-semibold text-[#14161C] pb-2 pr-4">${h}</th>`).join("")}
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`)}`;
    return Shell(inner);
  }

  function screenHistorial() {
    const rows = state.historial.map((r) => `
      <tr class="border-b border-[#F4F5F7] last:border-0">
        <td class="py-2.5 pr-4 text-[#5B6472]">${r.fecha}</td>
        <td class="py-2.5 pr-4 text-[#14161C]">${r.rutina}</td>
        <td class="py-2.5 pr-4 text-[#14161C]">${r.duracion} min</td>
        <td class="py-2.5 pr-4"><span class="font-semibold ${r.cumplimiento >= 95 ? "text-[#2FBF71]" : "text-[#FF5A1F]"}">${r.cumplimiento}%</span></td>
      </tr>`).join("");
    const inner = `
      ${SectionTitle("Historial de entrenamientos")}
      <p class="text-xs text-[#5B6472] mb-4">Mostrando solo días con entrenamiento registrado</p>
      ${Card(`<table class="w-full text-sm">
        <thead><tr class="border-b border-[#D8DDE3]">
          ${["Fecha","Rutina","Duración","Cumplimiento"].map((h) => `<th class="text-left text-xs font-semibold text-[#14161C] pb-2 pr-4">${h}</th>`).join("")}
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`)}`;
    return Shell(inner);
  }

  function screenEstadisticas() {
    const periodos = [["7d","7 días"],["30d","30 días"],["3m","3 meses"],["6m","6 meses"],["1a","1 año"]];
    const segButtons = periodos.map(([v, label]) => `
      <button onclick="App.setAndRender('periodo','${v}')" class="px-3 py-1 text-xs font-[Poppins] font-semibold rounded-full transition-all cursor-pointer ${state.periodo === v ? "bg-[#14161C] text-white" : "text-[#5B6472] hover:text-[#14161C]"}">${label}</button>`).join("");
    const peso = PESO_DATA[state.periodo] || PESO_DATA["30d"];
    const descanso = DESCANSO_DATA[state.periodo] || DESCANSO_DATA["30d"];
    const hidr = HIDRATACION_DATA[state.periodo] || HIDRATACION_DATA["30d"];
    const inner = `
      ${SectionTitle("Estadísticas")}
      <div class="mb-4"><div class="inline-flex bg-white border border-[#D8DDE3] rounded-full p-1 gap-1">${segButtons}</div></div>
      <div class="grid grid-cols-2 gap-3 mb-3">
        ${Card(`<p class="text-xs font-semibold text-[#5B6472] mb-3">Evolución de peso corporal (kg)</p>${MiniLineChart(peso, "#FF5A1F")}`)}
        ${Card(`<p class="text-xs font-semibold text-[#5B6472] mb-3">Cumplimiento de descansos</p>${MiniLineChart(descanso, "#2FBF71")}`)}
      </div>
      ${Card(`<p class="text-xs font-semibold text-[#5B6472] mb-3">Adherencia a hidratación</p>${MiniLineChart(hidr, "#12141A")}`)}`;
    return Shell(inner);
  }

  function screenRutinas() {
    const table = `${Card(`<table class="w-full text-sm">
      <thead><tr class="border-b border-[#D8DDE3]">
        ${["Nombre","N.º ejercicios","Última edición","Acciones"].map((h) => `<th class="text-left text-xs font-semibold text-[#14161C] pb-2 pr-4">${h}</th>`).join("")}
      </tr></thead>
      <tbody>${state.rutinas.map((r, i) => `
        <tr class="border-b border-[#F4F5F7] last:border-0 transition-colors ${state.selectedRutina === i ? "bg-[#FFF4F0]" : ""}">
          <td class="py-2.5 pr-4 font-medium text-[#14161C]">${r.nombre}</td>
          <td class="py-2.5 pr-4 text-[#5B6472]">${r.ejercicios.length}</td>
          <td class="py-2.5 pr-4 text-[#5B6472]">${r.ultimaEdicion}</td>
          <td class="py-2.5 pr-4">
            <button onclick="App.setAndRender('selectedRutina', ${i})" class="text-[#FF5A1F] hover:underline mr-3 cursor-pointer font-medium">Editar</button>
            <button onclick="App.deleteRutina(${i})" class="text-[#5B6472] hover:text-red-500 cursor-pointer">Eliminar</button>
          </td>
        </tr>`).join("")}</tbody>
    </table>`, "mb-4")}`;

    let editorHtml = "";
    if (state.selectedRutina !== null && state.rutinas[state.selectedRutina]) {
      const i = state.selectedRutina;
      const r = state.rutinas[i];
      const ejRows = r.ejercicios.map((ej, j) => {
        if (state.editingEj === j) {
          return `<div class="border border-[#D8DDE3] rounded-lg p-3">
            <div class="flex flex-col gap-2">
              <input value="${esc(ej.nombre)}" oninput="App.updateEjercicio(${i},${j},'nombre',this.value)" class="${inputCls}">
              <div class="grid grid-cols-3 gap-2">
                <div><label class="${labelCls}">Series</label><input type="number" min="1" value="${ej.series}" oninput="App.updateEjercicio(${i},${j},'series',this.value)" class="${inputCls}"></div>
                <div><label class="${labelCls}">Reps</label><input type="number" min="1" value="${ej.reps}" oninput="App.updateEjercicio(${i},${j},'reps',this.value)" class="${inputCls}"></div>
                <div><label class="${labelCls}">Descanso (s)</label><input type="number" min="10" step="10" value="${ej.descanso}" oninput="App.updateEjercicio(${i},${j},'descanso',this.value)" class="${inputCls}"></div>
              </div>
              <button onclick="App.setAndRender('editingEj', null)" class="text-xs text-[#2FBF71] font-semibold self-end cursor-pointer hover:underline">Guardar</button>
            </div>
          </div>`;
        }
        return `<div class="border border-[#D8DDE3] rounded-lg p-3">
          <div class="flex items-center justify-between">
            <div><p class="font-medium text-[#14161C] text-sm">${ej.nombre}</p><p class="text-xs text-[#5B6472]">${ej.series} series × ${ej.reps} rep · ${ej.descanso}s descanso</p></div>
            <div class="flex gap-3">
              <button onclick="App.setAndRender('editingEj', ${j})" class="text-xs text-[#5B6472] hover:text-[#FF5A1F] cursor-pointer">Editar</button>
              <button onclick="App.removeEjercicio(${i},${j})" class="text-xs text-[#5B6472] hover:text-red-500 cursor-pointer">&#10005;</button>
            </div>
          </div>
        </div>`;
      }).join("");
      editorHtml = Card(`<p class="font-[Poppins] font-bold text-base text-[#14161C] mb-3">Editor de rutina — ${r.nombre}</p>
        <div class="flex flex-col gap-2 mb-3">${ejRows}</div>
        <button onclick="App.navToRutinas('biblioteca')" class="w-full border border-dashed border-[#D8DDE3] rounded-lg py-2.5 text-sm text-[#5B6472] hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-colors cursor-pointer">+ Agregar ejercicio</button>`);
    }

    const newForm = state.showNewRutinaForm ? Card(`<p class="text-sm font-[Poppins] font-bold text-[#14161C] mb-3">Nueva rutina</p>
      <div class="flex gap-2">
        <input id="new-rutina-input" value="${esc(state.newRutinaName)}" oninput="App.set('newRutinaName', this.value)" onkeydown="if(event.key==='Enter')App.addRutina()" placeholder="Nombre de la rutina" class="${inputCls}">
        <button onclick="App.addRutina()" class="bg-[#FF5A1F] text-white font-bold text-sm px-4 rounded-lg hover:bg-[#e04d17] transition-all cursor-pointer whitespace-nowrap">Crear</button>
        <button onclick="App.setAndRender('showNewRutinaForm', false)" class="text-[#5B6472] text-sm px-3 rounded-lg hover:text-[#14161C] cursor-pointer">Cancelar</button>
      </div>`, "mb-4") : "";

    const inner = `
      <div class="flex items-center justify-between mb-4">
        ${SectionTitle("Rutinas")}
        <div class="flex gap-2">
          <button onclick="App.navToRutinas('biblioteca')" class="${btnOutline} w-auto px-4 text-xs py-2">Biblioteca</button>
          <button onclick="App.navToRutinas('asignar')" class="${btnOutline} w-auto px-4 text-xs py-2">Asignar</button>
          <button onclick="App.setAndRender('showNewRutinaForm', true)" class="bg-[#FF5A1F] text-white font-[Poppins] font-bold text-xs py-2 px-4 rounded-full hover:bg-[#e04d17] transition-all cursor-pointer whitespace-nowrap">+ Nueva rutina</button>
        </div>
      </div>
      ${newForm}
      ${table}
      ${editorHtml}`;
    return Shell(inner);
  }

  function bibliotecaResultsTable() {
    const q = state.busqueda.toLowerCase();
    const filtered = EJERCICIOS_BIBLIOTECA.filter((e) => e.nombre.toLowerCase().includes(q) || e.grupo.toLowerCase().includes(q));
    const rows = filtered.length
      ? filtered.map((e) => `
        <tr class="border-b border-[#F4F5F7] last:border-0">
          <td class="py-2.5 pr-4 text-[#14161C]">${e.nombre}</td>
          <td class="py-2.5 pr-4 text-[#5B6472]">${e.grupo}</td>
          <td class="py-2.5 pr-4"><button onclick="App.addEjercicio('${e.nombre.replace(/'/g,"\\'")}'); App.navigate('rutinas')" class="text-[#FF5A1F] font-medium hover:underline cursor-pointer text-xs">${state.selectedRutina !== null ? "Agregar a rutina" : "Selecciona una rutina"}</button></td>
        </tr>`).join("")
      : `<tr><td colspan="3" class="py-6 text-center text-[#5B6472] text-sm">Sin resultados</td></tr>`;
    return `<table class="w-full text-sm" id="biblioteca-results">
      <thead><tr class="border-b border-[#D8DDE3]">
        ${["Nombre","Grupo muscular","Acción"].map((h) => `<th class="text-left text-xs font-semibold text-[#14161C] pb-2 pr-4">${h}</th>`).join("")}
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function screenBiblioteca() {
    const inner = `
      <div class="flex items-center gap-3 mb-4">
        <button onclick="App.navigate('rutinas')" class="text-[#5B6472] hover:text-[#FF5A1F] cursor-pointer text-sm">&larr; Volver</button>
        ${SectionTitle("Biblioteca de ejercicios")}
      </div>
      <div class="mb-4">
        <input value="${esc(state.busqueda)}" oninput="App.set('busqueda', this.value); App.renderBibliotecaResults();" placeholder="Ej. sentadilla" class="${inputCls}">
      </div>
      ${Card(bibliotecaResultsTable())}`;
    return Shell(inner);
  }

  function screenAsignar() {
    const rows = state.asignaciones.map((a) => `
      <tr class="border-b border-[#F4F5F7] last:border-0">
        <td class="py-2.5 pr-4 text-[#14161C]">${a.usuario}</td>
        <td class="py-2.5 pr-4 text-[#5B6472]">${a.rutina}</td>
        <td class="py-2.5 pr-4 text-[#5B6472]">${a.fecha}</td>
      </tr>`).join("");
    const opciones = state.rutinas.map((r) => `<option ${state.asignarRutina === r.nombre ? "selected" : ""}>${r.nombre}</option>`).join("");
    const inner = `
      <div class="flex items-center gap-3 mb-4">
        <button onclick="App.navigate('rutinas')" class="text-[#5B6472] hover:text-[#FF5A1F] cursor-pointer text-sm">&larr; Volver</button>
        ${SectionTitle("Asignar rutina")}
      </div>
      ${Card(`<div class="flex flex-col gap-3">
        <div><label class="${labelCls}">Usuario</label><input value="${esc(state.asignarUsuario)}" oninput="App.set('asignarUsuario', this.value)" class="${inputCls}" placeholder="Camilo Perdomo"></div>
        <div><label class="${labelCls}">Rutina</label><select onchange="App.set('asignarRutina', this.value)" class="${inputCls}">${opciones}</select></div>
        <button onclick="App.handleAsignar()" class="${btnPrimary}">Asignar</button>
      </div>`, "mb-4")}
      ${Card(`<p class="text-xs font-semibold tracking-widest text-[#5B6472] uppercase mb-3">Rutinas asignadas actualmente</p>
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[#D8DDE3]">${["Usuario","Rutina","Asignada el"].map((h) => `<th class="text-left text-xs font-semibold text-[#14161C] pb-2 pr-4">${h}</th>`).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>`)}`;
    return Shell(inner);
  }

  function screenComunidad() {
    const changeBlock = state.showChangeBuddy
      ? `<div class="flex gap-2">
          <input value="${esc(state.newBuddy)}" oninput="App.set('newBuddy', this.value)" placeholder="Nombre del nuevo buddy" class="${inputCls}" autofocus>
          <button onclick="App.__confirmBuddy()" class="bg-[#FF5A1F] text-white font-bold text-sm px-4 rounded-lg cursor-pointer hover:bg-[#e04d17] transition-all whitespace-nowrap">Guardar</button>
          <button onclick="App.setAndRender('showChangeBuddy', false)" class="text-[#5B6472] text-sm px-3 rounded-lg hover:text-[#14161C] cursor-pointer">Cancelar</button>
        </div>`
      : `<button onclick="App.setAndRender('showChangeBuddy', true)" class="${btnOutline} w-auto px-6 text-sm">Cambiar</button>`;
    const feed = [
      { nombre: "Andrés G.", rutina: "Pierna", tiempo: "hace 2 horas" },
      { nombre: "Andrés G.", rutina: "Full body", tiempo: "ayer" },
    ].map((f) => `<div class="py-3 first:pt-0 last:pb-0"><p class="text-sm font-medium text-[#14161C]">${f.nombre} completó ${f.rutina}</p><p class="text-xs text-[#5B6472] mt-0.5">${f.tiempo}</p></div>`).join("");
    const inner = `
      ${SectionTitle("Comunidad")}
      ${Card(`<p class="text-sm font-[Poppins] font-bold text-[#14161C] mb-3">Tu gym buddy: ${state.gymBuddy}</p>${changeBlock}`, "mb-4")}
      ${Card(`<p class="text-xs font-semibold tracking-widest text-[#5B6472] uppercase mb-3">Actividad reciente de tu comunidad</p><div class="flex flex-col divide-y divide-[#F4F5F7]">${feed}</div>`)}`;
    return Shell(inner);
  }

  window.App.__confirmBuddy = function () {
    if (state.newBuddy.trim()) { state.gymBuddy = state.newBuddy.trim(); state.newBuddy = ""; }
    state.showChangeBuddy = false;
    render();
  };

  function screenCuenta() {
    const inner = `
      ${SectionTitle("Cuenta")}
      <div class="flex flex-col gap-4">
        ${Card(`<p class="text-xs font-semibold tracking-widest text-[#5B6472] uppercase mb-3">Perfil</p>
          <div class="flex flex-col gap-3">
            <div><label class="${labelCls}">Nombre</label><input value="${esc(state.nombre)}" oninput="App.set('nombre', this.value)" class="${inputCls}"></div>
            <div><label class="${labelCls}">Correo</label><input type="email" value="${esc(state.correo)}" oninput="App.set('correo', this.value)" class="${inputCls}"></div>
            <div><label class="${labelCls}">Contraseña</label><input type="password" value="" oninput="App.set('cuentaPassword', this.value)" placeholder="••••••••" class="${inputCls}"></div>
          </div>`)}
        ${Card(`<p class="text-xs font-semibold tracking-widest text-[#5B6472] uppercase mb-3">Preferencias de notificación</p>
          <div class="flex flex-col gap-3">
            ${Toggle("Notificaciones push", "notifPush", state.notifPush)}
            ${Toggle("Notificaciones por correo", "notifEmail", state.notifEmail)}
          </div>`)}
        ${Card(`<p class="text-xs font-semibold tracking-widest text-[#5B6472] uppercase mb-3">Dispositivos vinculados</p>
          <div class="flex items-center justify-between">
            <div><p class="text-sm font-medium text-[#14161C]">Galaxy Watch 5</p><p class="text-xs text-[#2FBF71] mt-0.5">Conectado</p></div>
            <span class="w-2.5 h-2.5 rounded-full bg-[#2FBF71]"></span>
          </div>`)}
        <button onclick="App.saveCuenta()" class="${btnPrimary}">${state.savedCuenta ? "✓ Guardado" : "Guardar cambios"}</button>
      </div>`;
    return Shell(inner);
  }

  // ------------------------------------------------------------- RENDER ---
  const SCREENS = {
    "login": screenLogin, "dashboard": screenDashboard, "historial": screenHistorial,
    "estadisticas": screenEstadisticas, "rutinas": screenRutinas, "biblioteca": screenBiblioteca,
    "asignar": screenAsignar, "comunidad": screenComunidad, "cuenta": screenCuenta,
  };

  function render() {
    const fn = SCREENS[state.page] || screenLogin;
    document.getElementById("app").innerHTML = fn();
  }

  document.addEventListener("DOMContentLoaded", render);
})();
