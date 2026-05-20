/* ═══════════════════════════════════════════════════════════════════════════
   CUESTIONARIO DE PRÁCTICA v2.0
   ───────────────────────────────────────────────────────────────────────────
   Para agregar un TEMA:  añade { clave: "ruta.json" } en `temas`
                          y su nombre en la materia correspondiente en `materias`
   Para agregar MATERIA:  añade un bloque en `materias` con los temas que la componen
   Para agregar TIPO:     añade la clave en `TIPOS` y su función render/verificar
   ═══════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTES DE CONTENIDO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEMAS — mapa clave → ruta del JSON de preguntas.
 * Formato requerido: string plano con la ruta al archivo.
 * Añadir nuevo tema: agregar aquí y en la materia correspondiente de `materias`.
 */
const temas = {
  acuerdo_001:            "data/acuerdo_001.json",
  radicacion:             "data/radicacion.json",
  acuerdo_060:            "data/acuerdo_060.json",
  prestamo:               "data/prestamo.json",
  manual_correspondencia: "data/manual_correspondencia.json",
  fundamentos_control_documental: "data/fundamentos_control_documental.json",
  instrumentos_control_archivistico: "data/instrumentos_control_archivistico.json",
  formatos_registros_control: "data/formatos_registros_control.json",
  calidad_mejora_continua: "data/calidad_mejora_continua.json",
  normativa_aplicable: "data/normativa_aplicable.json",
  fondo_acumulado_todo: "data/fondo_acumulado_todo.json"
};

/**
 * MATERIAS — agrupan los temas por asignatura.
 * Cada materia referencia claves que deben existir en `temas`.
 *
 * Para agregar nueva materia: copiar la plantilla comentada al final.
 */
const materias = {
  gestion_documental: {
    nombre: "Gestión Documental",
    icono:  "📁",
    color:  "#00ffc3",
    temas: {
      acuerdo_001:            "Acuerdo 001 de 2024 – AGN",
      radicacion:             "Radicación y despacho",
      acuerdo_060:            "Acuerdo 060 – Normas de presentación",
      prestamo:               "Préstamo de documentos",
      manual_correspondencia: "Manual de correspondencia",
    }
  },
  fondo_acumulado: {
      nombre: "Fondo Acumulado",
      icono:  "📚",
      color:  "#ffbe00",
      temas: {
        fundamentos_control_documental: "Fundamentos de Control Documental",
        instrumentos_control_archivistico: "Instrumentos de Control Archivístico",
        formatos_registros_control: "Formatos y Registros de Control",
        calidad_mejora_continua: "Calidad y Mejora Continua",
        normativa_aplicable: "Normativa Aplicable",
        fondo_acumulado_todo: "Fondo Acumulado – Todo el temario"
      }
  }
  // ── Plantilla para nueva materia ────────────────────────────────────────
  // nueva_materia: {
  //   nombre: "Nombre de la Materia",
  //   icono:  "📖",
  //   color:  "#ffbe00",
  //   temas: {
  //     clave_tema: "Nombre visible del tema"   // clave debe estar en `temas`
  //   }
  // }
};

/**
 * TIPOS DE PREGUNTA — registra cada tipo con su etiqueta e ícono.
 * Para agregar tipo nuevo: añadir aquí y crear funciones render_* y verificar_*.
 */
const TIPOS = {
  multiple:        { label: "Opción múltiple",   icon: "☑️"  },
  verdadero_falso: { label: "Verdadero / Falso", icon: "⚖️"  },
  completar:       { label: "Completar",         icon: "✏️"  },
  arrastrar:       { label: "Relacionar",        icon: "🔗"  }
  // nuevo_tipo: { label: "Nombre", icon: "🆕" }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ESTADO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
let preguntas         = [];
let respuestasUsuario = [];
let indiceActual      = 0;
let puntaje           = 0;
let timer             = null;
let tiempoRestante    = 0;
let tiempoInicio      = null;
let modoActual        = "todos";
let selectedTerm      = null;   // para el modo arrastrar

// ─────────────────────────────────────────────────────────────────────────────
// 3. REFERENCIAS DOM
// ─────────────────────────────────────────────────────────────────────────────
const configPanel        = document.getElementById("configPanel");
const infoBar            = document.getElementById("info");
const cuestionarioDiv    = document.getElementById("cuestionario");
const resultadoDiv       = document.getElementById("resultado");

const opcionTemaDiv      = document.getElementById("opcionTema");
const opcionPorMatDiv    = document.getElementById("opcionPorMateria");
const materiaParaTemaEl  = document.getElementById("materiaParaTema");
const temaSelectEl       = document.getElementById("temaSelect");
const materiasCheckGrid  = document.getElementById("materiasCheckGrid");

const cantidadInput      = document.getElementById("cantidad");
const tiempoInput        = document.getElementById("tiempoPorPregunta");
const tiempoExamenInput  = document.getElementById("tiempoExamen");
const tiempoConfig       = document.getElementById("tiempoConfig");
const tiempoExamenConfig = document.getElementById("tiempoExamenConfig");

const iniciarBtn         = document.getElementById("iniciar");
const contadorEl         = document.getElementById("contadorPreguntas");
const tipoBadgeEl        = document.getElementById("tipoBadge");
const temporizadorEl     = document.getElementById("temporizador");
const barraProgreso      = document.getElementById("barraProgreso");
const preguntaEl         = document.getElementById("pregunta");
const opcionesEl         = document.getElementById("opciones");
const siguienteBtn       = document.getElementById("siguiente");
const feedbackEl         = document.getElementById("feedback");

// Zonas de tipos especiales
const zonaCompletar      = document.getElementById("zonaCompletar");
const inputCompletar     = document.getElementById("inputCompletar");
const btnCompletar       = document.getElementById("btnCompletar");
const zonaArrastrar      = document.getElementById("zonaArrastrar");
const terminosList       = document.getElementById("terminosList");
const definicionesList   = document.getElementById("definicionesList");
const btnVerificarArr    = document.getElementById("btnVerificarArrastrar");

// Resultados
const resultadoEmoji     = document.getElementById("resultadoEmoji");
const puntajeEl          = document.getElementById("puntaje");
const tiempoFinalEl      = document.getElementById("tiempoFinal");
const reintentarBtn      = document.getElementById("reintentar");
const statsGrid          = document.getElementById("statsGrid");
const resumenDiv         = document.getElementById("resumen");

// ─────────────────────────────────────────────────────────────────────────────
// 4. INICIALIZACIÓN DE LA UI
// ─────────────────────────────────────────────────────────────────────────────
function initUI() {

  // ── Modo cards: marcar "todos" como activo por defecto ──────────────────
  sincronizarModoCards("todos");

  // ── Poblar materia selector para modo "tema" ────────────────────────────
  Object.entries(materias).forEach(([key, mat]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${mat.icono} ${mat.nombre}`;
    materiaParaTemaEl.appendChild(opt);
  });
  actualizarTemasSelect();
  materiaParaTemaEl.addEventListener("change", actualizarTemasSelect);

  // ── Poblar checkboxes para modo "por_materia" ───────────────────────────
  Object.entries(materias).forEach(([key, mat]) => {
    const label = document.createElement("label");
    label.className = "materia-check-card checked";
    label.dataset.key = key;
    label.innerHTML = `
      <input type="checkbox" value="${key}" checked />
      <span class="mcc-icon">${mat.icono}</span>
      <div class="mcc-info">
        <div class="mcc-nombre">${mat.nombre}</div>
        <div class="mcc-count">${Object.keys(mat.temas).length} temas</div>
      </div>
      <span class="mcc-dot"></span>
    `;
    label.addEventListener("click", e => {
      const cb = label.querySelector("input");
      cb.checked = !cb.checked;
      label.classList.toggle("checked", cb.checked);
    });
    materiasCheckGrid.appendChild(label);
  });

  // ── Listeners de modo cards ─────────────────────────────────────────────
  document.querySelectorAll(".modo-card").forEach(card => {
    card.addEventListener("click", () => {
      const radio = card.querySelector("input[type=radio]");
      radio.checked = true;
      sincronizarModoCards(radio.value);
      onModoChange(radio.value);
    });
  });

  // Sincronizar el estado inicial
  onModoChange("todos");
}

function sincronizarModoCards(modo) {
  document.querySelectorAll(".modo-card").forEach(card => {
    card.classList.toggle("active", card.dataset.modo === modo);
  });
}

function actualizarTemasSelect() {
  temaSelectEl.innerHTML = "";
  const matKey = materiaParaTemaEl.value;
  const mat = materias[matKey];
  if (!mat) return;
  Object.entries(mat.temas).forEach(([key, nombre]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = nombre;
    temaSelectEl.appendChild(opt);
  });
}

function onModoChange(modo) {
  modoActual = modo;
  const esExamen = modo === "examen";
  const esTema   = modo === "tema";
  const esMat    = modo === "por_materia";
  const esNuevo  = modo === "nuevo";

  opcionTemaDiv.style.display        = esTema   ? "block" : "none";
  opcionPorMatDiv.style.display      = esMat    ? "block" : "none";
  tiempoConfig.style.display         = esExamen ? "none"  : "flex";
  tiempoExamenConfig.style.display   = esExamen ? "flex"  : "none";

  iniciarBtn.textContent = esNuevo ? "✨ Ver modalidad →" : "▶ Iniciar cuestionario";
  iniciarBtn.classList.toggle("btn-pronto", esNuevo);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. INICIO DEL CUESTIONARIO
// ─────────────────────────────────────────────────────────────────────────────
iniciarBtn.addEventListener("click", async () => {
  if (modoActual === "nuevo") {
    mostrarNuevoModo();
    return;
  }

  // Reset estado
  respuestasUsuario = [];
  puntaje = 0;
  indiceActual = 0;
  selectedTerm = null;

  // Ocultar config, mostrar loading
  configPanel.style.display = "none";
  infoBar.style.display = "block";
  infoBar.textContent = "⏳ Cargando preguntas…";
  cuestionarioDiv.style.display = "none";
  resultadoDiv.style.display = "none";

  try {
    preguntas = await cargarPreguntas();
  } catch (err) {
    infoBar.textContent = `❌ Error cargando preguntas: ${err.message}`;
    configPanel.style.display = "block";
    return;
  }

  if (preguntas.length === 0) {
    infoBar.textContent = "⚠️ No se encontraron preguntas para la selección actual.";
    configPanel.style.display = "block";
    return;
  }

  // Mezclar y limitar
  preguntas = preguntas.sort(() => Math.random() - 0.5);
  const cantidad = parseInt(cantidadInput.value);
  if (!isNaN(cantidad) && cantidad > 0 && cantidad < preguntas.length) {
    preguntas = preguntas.slice(0, cantidad);
  }

  // Info bar
  const resumenTipos = contarTipos(preguntas);
  infoBar.textContent = modoActual === "examen"
    ? `🧾 Modo examen · ${preguntas.length} preguntas · ${resumenTipos}`
    : `📋 ${preguntas.length} preguntas · ${resumenTipos}`;

  tiempoInicio = Date.now();
  if (modoActual === "examen") iniciarTemporizadorExamen();

  cuestionarioDiv.style.display = "block";
  mostrarPregunta();
});

function contarTipos(lista) {
  const cnt = {};
  lista.forEach(p => {
    const t = p.tipo || "multiple";
    cnt[t] = (cnt[t] || 0) + 1;
  });
  return Object.entries(cnt)
    .map(([t, n]) => `${TIPOS[t]?.icon || "❓"} ${n}`)
    .join("  ");
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CARGA DE PREGUNTAS
// ─────────────────────────────────────────────────────────────────────────────
async function cargarPreguntas() {
  if (modoActual === "tema") {
    const key = temaSelectEl.value;
    const matKey = materiaParaTemaEl.value;
    return normalizarPreguntas(await cargarJSON(temas[key]), key, matKey);
  }

  if (modoActual === "por_materia") {
    const seleccionadas = Array.from(materiasCheckGrid.querySelectorAll("input:checked"))
      .map(cb => cb.value);
    return await cargarMaterias(seleccionadas);
  }

  // "todos" y "examen": cargar todas las materias
  return await cargarMaterias(Object.keys(materias));
}

async function cargarMaterias(listaMateriaKeys) {
  const resultado = [];
  for (const matKey of listaMateriaKeys) {
    const mat = materias[matKey];
    if (!mat) continue;
    for (const temaKey of Object.keys(mat.temas)) {
      if (!temas[temaKey]) continue;
      try {
        const data = await cargarJSON(temas[temaKey]);
        resultado.push(...normalizarPreguntas(data, temaKey, matKey));
      } catch (e) {
        console.warn(`No se pudo cargar "${temaKey}":`, e.message);
      }
    }
  }
  return resultado;
}

function normalizarPreguntas(data, temaKey = "", materiaKey = "") {
  const lista = Array.isArray(data) ? data : (data.preguntas || []);
  return lista.map(q => ({
    ...q,
    tipo:     q.tipo || "multiple",
    _tema:    temaKey,
    _materia: materiaKey
  }));
}

async function cargarJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${url}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MOSTRAR PREGUNTA (despachador por tipo)
// ─────────────────────────────────────────────────────────────────────────────
function mostrarPregunta() {
  const q = preguntas[indiceActual];
  const tipo = q.tipo || "multiple";

  // Reset zonas
  opcionesEl.innerHTML = "";
  feedbackEl.style.display = "none";
  feedbackEl.className = "feedback";
  zonaCompletar.style.display = "none";
  zonaArrastrar.style.display = "none";
  inputCompletar.value = "";
  inputCompletar.disabled = false;
  btnCompletar.disabled = false;
  btnVerificarArr.disabled = false;
  siguienteBtn.disabled = true;
  selectedTerm = null;

  // Metadatos
  const tipoInfo = TIPOS[tipo] || TIPOS.multiple;
  tipoBadgeEl.textContent = `${tipoInfo.icon} ${tipoInfo.label}`;
  tipoBadgeEl.className = `tipo-badge tipo-${tipo}`;

  contadorEl.textContent = `${indiceActual + 1} / ${preguntas.length}`;
  barraProgreso.style.width = `${(indiceActual / preguntas.length) * 100}%`;

  preguntaEl.textContent = q.pregunta;

  // Despachar render según tipo
  const renderFn = {
    multiple:        () => renderMultiple(q),
    verdadero_falso: () => renderVerdaderoFalso(q),
    completar:       () => renderCompletar(q),
    arrastrar:       () => renderArrastrar(q)
    // nuevo_tipo: () => renderNuevoTipo(q)
  };
  (renderFn[tipo] || renderFn.multiple)();

  // Temporizador (solo en modo práctica)
  if (modoActual !== "examen") {
    temporizadorEl.textContent = "";
    iniciarTemporizadorPregunta();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. RENDER Y VERIFICACIÓN POR TIPO
// ─────────────────────────────────────────────────────────────────────────────

// ── 8a. Opción múltiple ──────────────────────────────────────────────────────
function renderMultiple(q) {
  q.opciones.forEach((texto, i) => {
    const btn = document.createElement("button");
    btn.className = "opcion-btn";
    btn.textContent = texto;
    btn.onclick = () => seleccionarOpcion(i, q);
    opcionesEl.appendChild(btn);
  });
}

function seleccionarOpcion(i, q) {
  clearInterval(timer);
  const correcto = i === q.respuesta;
  registrarRespuesta(q, { tipo: q.tipo || "multiple", seleccion: i, correcto });

  if (modoActual !== "examen") {
    Array.from(opcionesEl.children).forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.respuesta) btn.classList.add("correcta");
      else if (idx === i)      btn.classList.add("incorrecta");
    });
    mostrarFeedback(correcto, q.opciones[q.respuesta], q.explicacion);
  }

  if (correcto) puntaje++;
  siguienteBtn.disabled = false;
}

// ── 8b. Verdadero / Falso ────────────────────────────────────────────────────
function renderVerdaderoFalso(q) {
  ["Verdadero", "Falso"].forEach((texto, i) => {
    const btn = document.createElement("button");
    btn.className = "opcion-btn vf-btn";
    btn.textContent = i === 0 ? "✅ Verdadero" : "❌ Falso";
    btn.onclick = () => seleccionarOpcion(i, { ...q, opciones: ["Verdadero", "Falso"] });
    opcionesEl.appendChild(btn);
  });
}

// ── 8c. Completar ────────────────────────────────────────────────────────────
function renderCompletar(q) {
  zonaCompletar.style.display = "flex";
  setTimeout(() => inputCompletar.focus(), 50);

  const verificar = () => {
    clearInterval(timer);
    const dada    = inputCompletar.value.trim().toLowerCase();
    const correcta = String(q.respuesta || "").trim().toLowerCase();
    const alts    = (q.alternativas || []).map(a => a.toLowerCase());
    const correcto = dada === correcta || alts.includes(dada);

    inputCompletar.disabled = true;
    btnCompletar.disabled = true;
    inputCompletar.classList.add(correcto ? "input-correcta" : "input-incorrecta");

    registrarRespuesta(q, {
      tipo: "completar",
      seleccion: inputCompletar.value,
      correcto
    });

    mostrarFeedback(correcto, q.respuesta, q.explicacion);
    if (correcto) puntaje++;
    siguienteBtn.disabled = false;
  };

  btnCompletar.onclick = verificar;
  inputCompletar.onkeydown = e => { if (e.key === "Enter") verificar(); };
}

// ── 8d. Arrastrar / Relacionar ───────────────────────────────────────────────
/**
 * Mecánica: clic en un término → queda seleccionado (resaltado).
 * Clic en un slot de definición → coloca el término seleccionado.
 * Funciona en desktop y móvil sin necesidad de API de arrastre.
 */
function renderArrastrar(q) {
  zonaArrastrar.style.display = "block";
  terminosList.innerHTML = "";
  definicionesList.innerHTML = "";

  const asignaciones = {}; // índice_slot → término asignado
  const correctos = {};    // índice_slot → término correcto

  q.pares.forEach((par, i) => { correctos[i] = par.termino; });

  // Mezclar términos
  const mezclados = [...q.pares].sort(() => Math.random() - 0.5);

  // Crear elementos de término
  mezclados.forEach(par => {
    const el = document.createElement("div");
    el.className = "term-item";
    el.textContent = par.termino;
    el.dataset.termino = par.termino;
    el.onclick = () => seleccionarTermino(el, par.termino);
    terminosList.appendChild(el);
  });

  // Crear slots de definición
  q.pares.forEach((par, i) => {
    const slotWrap = document.createElement("div");
    slotWrap.className = "def-slot";

    const slotDrop = document.createElement("div");
    slotDrop.className = "slot-drop";
    slotDrop.dataset.idx = i;
    slotDrop.textContent = "—";

    const slotDef = document.createElement("div");
    slotDef.className = "slot-def";
    slotDef.textContent = par.definicion;

    slotDrop.onclick = () => colocarEnSlot(slotDrop, i, asignaciones);

    slotWrap.appendChild(slotDrop);
    slotWrap.appendChild(slotDef);
    definicionesList.appendChild(slotWrap);
  });

  btnVerificarArr.onclick = () => {
    clearInterval(timer);
    verificarArrastrar(q, asignaciones, correctos);
  };
}

function seleccionarTermino(el, termino) {
  // Si el término ya está colocado en un slot, permitir reselección
  if (el.classList.contains("term-placed") && !el.classList.contains("selected")) {
    // Quitar del slot donde estaba
    document.querySelectorAll(".slot-drop").forEach(s => {
      if (s.dataset.colocado === termino) {
        s.textContent = "—";
        s.classList.remove("filled");
        delete s.dataset.colocado;
      }
    });
    el.classList.remove("term-placed");
  }

  const yaSeleccionado = el.classList.contains("selected");
  // Deseleccionar todo
  document.querySelectorAll(".term-item.selected").forEach(t => t.classList.remove("selected"));
  document.querySelectorAll(".slot-drop.slot-ready").forEach(s => s.classList.remove("slot-ready"));

  if (!yaSeleccionado) {
    selectedTerm = { termino, el };
    el.classList.add("selected");
    document.querySelectorAll(".slot-drop:not(.slot-ok):not(.slot-err)").forEach(s => s.classList.add("slot-ready"));
  } else {
    selectedTerm = null;
  }
}

function colocarEnSlot(slotEl, idx, asignaciones) {
  if (!selectedTerm) return;

  // Si el slot ya tenía un término, devolverlo
  const anteriorTermino = slotEl.dataset.colocado;
  if (anteriorTermino) {
    document.querySelectorAll(".term-item").forEach(t => {
      if (t.dataset.termino === anteriorTermino) {
        t.classList.remove("term-placed");
      }
    });
  }

  // Si el mismo término estaba en otro slot, limpiarlo
  document.querySelectorAll(".slot-drop").forEach(s => {
    if (s !== slotEl && s.dataset.colocado === selectedTerm.termino) {
      s.textContent = "—";
      s.classList.remove("filled");
      delete s.dataset.colocado;
      delete asignaciones[parseInt(s.dataset.idx)];
    }
  });

  // Colocar
  slotEl.textContent = selectedTerm.termino;
  slotEl.dataset.colocado = selectedTerm.termino;
  slotEl.classList.add("filled");
  slotEl.classList.remove("slot-ready");
  asignaciones[idx] = selectedTerm.termino;
  selectedTerm.el.classList.add("term-placed");
  selectedTerm.el.classList.remove("selected");

  // Deseleccionar
  document.querySelectorAll(".slot-drop.slot-ready").forEach(s => s.classList.remove("slot-ready"));
  selectedTerm = null;
}

function verificarArrastrar(q, asignaciones, correctos) {
  let aciertos = 0;
  document.querySelectorAll(".slot-drop").forEach(slotEl => {
    const idx     = parseInt(slotEl.dataset.idx);
    const colocado = slotEl.dataset.colocado || "";
    const correcto = colocado === correctos[idx];
    slotEl.classList.remove("filled", "slot-ready");
    slotEl.classList.add(correcto ? "slot-ok" : "slot-err");
    if (correcto) aciertos++;
  });

  document.querySelectorAll(".term-item").forEach(el => { el.onclick = null; });
  btnVerificarArr.disabled = true;

  const todosCorrectos = aciertos === q.pares.length;
  registrarRespuesta(q, {
    tipo: "arrastrar",
    asignaciones: { ...asignaciones },
    aciertos,
    totalPares: q.pares.length,
    correcto: todosCorrectos
  });

  mostrarFeedback(todosCorrectos,
    null,
    todosCorrectos ? null : `Aciertos: ${aciertos}/${q.pares.length}`,
    q.explicacion
  );
  if (todosCorrectos) puntaje++;
  siguienteBtn.disabled = false;
}

// ── Registro genérico de respuesta ──────────────────────────────────────────
function registrarRespuesta(q, extras) {
  respuestasUsuario.push({
    pregunta:  q.pregunta,
    opciones:  q.opciones,
    respuesta: q.respuesta,
    pares:     q.pares,
    _tema:     q._tema,
    _materia:  q._materia,
    ...extras
  });
}

// ── Feedback visual ──────────────────────────────────────────────────────────
function mostrarFeedback(correcto, respuestaCorrecta, mensajeAdicional, explicacion) {
  if (modoActual === "examen") return;
  feedbackEl.style.display = "block";
  feedbackEl.className = `feedback ${correcto ? "feedback-ok" : "feedback-err"}`;

  let html = correcto
    ? "<strong>✅ ¡Correcto!</strong>"
    : `<strong>❌ Incorrecto</strong>${respuestaCorrecta ? `<br><span class="rev-ok">✅ Respuesta: ${respuestaCorrecta}</span>` : ""}`;

  if (mensajeAdicional)
    html += `<br><span class="rev-det">${mensajeAdicional}</span>`;
  if (explicacion)
    html += `<div class="expl-inline">${explicacion}</div>`;

  feedbackEl.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TEMPORIZADORES
// ─────────────────────────────────────────────────────────────────────────────
function iniciarTemporizadorPregunta() {
  clearInterval(timer);
  const segs = parseInt(tiempoInput.value);
  if (isNaN(segs) || segs <= 0) return;

  tiempoRestante = segs;
  actualizarTimerUI(tiempoRestante, segs);

  timer = setInterval(() => {
    tiempoRestante--;
    actualizarTimerUI(tiempoRestante, segs);
    if (tiempoRestante <= 0) {
      clearInterval(timer);
      tiempoAgotado();
    }
  }, 1000);
}

function actualizarTimerUI(restante, total) {
  temporizadorEl.textContent = `⏱️ ${restante}s`;
  temporizadorEl.className = (restante / total < 0.3) ? "temporizador temporizador-urgente" : "temporizador";
}

function tiempoAgotado() {
  const q = preguntas[indiceActual];
  // Bloquear controles
  Array.from(opcionesEl.children).forEach(btn => btn.disabled = true);
  inputCompletar.disabled = true;
  btnCompletar.disabled = true;
  btnVerificarArr.disabled = true;

  const correctaTexto = q.tipo === "completar" ? q.respuesta
    : (q.opciones && q.respuesta !== undefined) ? q.opciones[q.respuesta] : null;

  registrarRespuesta(q, { tipo: q.tipo || "multiple", seleccion: -1, correcto: false, sinResponder: true });
  mostrarFeedback(false, correctaTexto, "⏰ Tiempo agotado");
  siguienteBtn.disabled = false;
}

function iniciarTemporizadorExamen() {
  const minutos = parseInt(tiempoExamenInput.value);
  if (isNaN(minutos) || minutos <= 0) return;
  let totalSeg = minutos * 60;

  timer = setInterval(() => {
    totalSeg--;
    const m = Math.floor(totalSeg / 60);
    const s = totalSeg % 60;
    temporizadorEl.textContent = `⏳ ${m}:${String(s).padStart(2, "0")}`;
    if (totalSeg <= 0) { clearInterval(timer); mostrarResultado(); }
  }, 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. SIGUIENTE PREGUNTA
// ─────────────────────────────────────────────────────────────────────────────
siguienteBtn.addEventListener("click", () => {
  indiceActual++;
  if (indiceActual < preguntas.length) mostrarPregunta();
  else mostrarResultado();
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. RESULTADOS
// ─────────────────────────────────────────────────────────────────────────────
function mostrarResultado() {
  clearInterval(timer);
  cuestionarioDiv.style.display = "none";
  resultadoDiv.style.display = "block";
  barraProgreso.style.width = "100%";

  const elapsed = Math.floor((Date.now() - tiempoInicio) / 1000);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  tiempoFinalEl.textContent = `🕒 Tiempo: ${m}m ${s}s`;

  const pct = preguntas.length > 0 ? puntaje / preguntas.length : 0;
  const pctStr = (pct * 100).toFixed(1);
  puntajeEl.textContent = `${puntaje} / ${preguntas.length}  (${pctStr}%)`;

  resultadoEmoji.textContent = pct >= 0.9 ? "🏆"
    : pct >= 0.7 ? "⭐"
    : pct >= 0.5 ? "📈"
    : "💪";

  // Stats por tipo
  const stats = {};
  respuestasUsuario.forEach(r => {
    const t = r.tipo || "multiple";
    if (!stats[t]) stats[t] = { total: 0, ok: 0 };
    stats[t].total++;
    if (r.correcto) stats[t].ok++;
  });
  statsGrid.innerHTML = Object.entries(stats).map(([t, v]) => `
    <div class="stat-card">
      <div class="stat-icon">${TIPOS[t]?.icon || "❓"}</div>
      <div class="stat-nombre">${TIPOS[t]?.label || t}</div>
      <div class="stat-valor">${v.ok}/${v.total}</div>
    </div>
  `).join("");

  // Revisión detallada
  resumenDiv.innerHTML = "<h3>Revisión detallada</h3>";
  respuestasUsuario.forEach((r, idx) => construirRevision(r, idx));
}

function construirRevision(r, idx) {
  const tipo = r.tipo || "multiple";
  const tipoInfo = TIPOS[tipo] || TIPOS.multiple;
  const matNombre = materias[r._materia]?.nombre || r._materia || "";
  const temaNombre = r._materia && r._tema
    ? (materias[r._materia]?.temas[r._tema] || r._tema)
    : "";

  const cont = document.createElement("div");
  cont.className = `revision-item ${r.correcto ? "acertada" : "fallada"}`;

  let detalle = "";

  if (tipo === "multiple" || tipo === "verdadero_falso") {
    const opciones = r.opciones || ["Verdadero", "Falso"];
    const correctaTexto  = opciones[r.respuesta] ?? "—";
    const seleccionTexto = r.sinResponder ? "Sin responder"
      : r.seleccion >= 0 ? opciones[r.seleccion] : "Sin responder";
    detalle = `
      <p class="rev-ok">✅ Correcta: <strong>${correctaTexto}</strong></p>
      <p class="${r.correcto ? "rev-det" : "rev-err"}">🧍 Tu respuesta: ${seleccionTexto}</p>
    `;
  } else if (tipo === "completar") {
    detalle = `
      <p class="rev-ok">✅ Respuesta: <strong>${r.respuesta}</strong></p>
      <p class="${r.correcto ? "rev-det" : "rev-err"}">🧍 Tu respuesta: ${r.seleccion || "Sin responder"}</p>
    `;
  } else if (tipo === "arrastrar") {
    const filas = (r.pares || []).map((par, i) => {
      const dado = r.asignaciones?.[i] || "—";
      const ok = dado === par.termino;
      return `
        <div class="drag-review-row">
          <span class="dr-term ${ok ? "rev-ok" : "rev-err"}">${dado || "—"}</span>
          <span class="dr-arrow">→</span>
          <span class="dr-given rev-det">${par.definicion}</span>
          ${!ok ? `<span class="rev-ok">(correcto: ${par.termino})</span>` : ""}
        </div>
      `;
    }).join("");
    detalle = `<p class="rev-det">Aciertos: ${r.aciertos ?? 0}/${r.totalPares ?? 0}</p>${filas}`;
  }

  cont.innerHTML = `
    <div class="revision-header">
      <span class="rev-tipo">${tipoInfo.icon} ${tipoInfo.label}</span>
      <span class="rev-materia">${matNombre}${temaNombre ? " · " + temaNombre : ""}</span>
    </div>
    <p class="rev-pregunta">${idx + 1}. ${r.pregunta}</p>
    ${detalle}
  `;
  resumenDiv.appendChild(cont);
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. NUEVA MODALIDAD (plantilla escalable)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Para implementar la nueva modalidad:
 * 1. Añade su modo a la constante de modos en el HTML.
 * 2. Completa esta función con su lógica.
 * 3. Añade su caso en onModoChange() si requiere configuración especial.
 */
function mostrarNuevoModo() {
  configPanel.style.display = "none";
  cuestionarioDiv.style.display = "none";
  resultadoDiv.style.display = "none";
  infoBar.style.display = "block";
  infoBar.innerHTML = `
    <div class="nuevo-modo-screen">
      <div class="nm-emoji">✨</div>
      <div class="nm-title">Nueva modalidad</div>
      <div class="nm-desc">
        Esta modalidad está en desarrollo.<br>
        Aquí podrás practicar de una forma completamente distinta.<br>
        <small style="color:var(--muted2)">Añade su lógica en la función <code>mostrarNuevoModo()</code> de script.js.</small>
      </div>
      <button onclick="location.reload()" class="btn-primary" style="max-width:200px;margin:0 auto">← Volver</button>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. REINICIAR
// ─────────────────────────────────────────────────────────────────────────────
reintentarBtn.addEventListener("click", () => location.reload());

// ─────────────────────────────────────────────────────────────────────────────
// ARRANQUE
// ─────────────────────────────────────────────────────────────────────────────
initUI();