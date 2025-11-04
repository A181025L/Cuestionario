const temas = {
  recibo_despacho: "data/recibo_despacho.json",
  acuerdo_001: "data/acuerdo_001.json",
  radicacion: "data/radicacion.json",
  acuerdo_060: "data/acuerdo_060.json",
  prestamo: "data/prestamo.json",
  manual_correspondencia: "data/manual_correspondencia.json"
};

const modoSelect = document.getElementById("modo");
const temaSelect = document.getElementById("tema");
const seleccionTemaDiv = document.getElementById("seleccionTema");
const cantidadInput = document.getElementById("cantidad");
const tiempoInput = document.getElementById("tiempoPorPregunta");
const tiempoExamenInput = document.getElementById("tiempoExamen");
const tiempoConfig = document.getElementById("tiempoConfig");
const tiempoExamenConfig = document.getElementById("tiempoExamenConfig");

const iniciarBtn = document.getElementById("iniciar");
const infoDiv = document.getElementById("info");
const cuestionarioDiv = document.getElementById("cuestionario");
const preguntaEl = document.getElementById("pregunta");
const opcionesEl = document.getElementById("opciones");
const siguienteBtn = document.getElementById("siguiente");
const temporizadorEl = document.getElementById("temporizador");
const barraProgreso = document.getElementById("barraProgreso");
const resultadoDiv = document.getElementById("resultado");
const puntajeEl = document.getElementById("puntaje");
const resumenDiv = document.getElementById("resumen");
const tiempoFinalEl = document.getElementById("tiempoFinal");
const reintentarBtn = document.getElementById("reintentar");
const configDiv = document.querySelector(".config");

let preguntas = [];
let respuestasUsuario = [];
let indiceActual = 0;
let puntaje = 0;
let timer = null;
let tiempoRestante = 0;
let tiempoInicio = null;
let modoExamen = false;

// --- CAMBIO VISUAL SEGÚN MODO ---
modoSelect.addEventListener("change", () => {
  const modo = modoSelect.value;
  seleccionTemaDiv.style.display = modo === "tema" ? "block" : "none";
  tiempoConfig.style.display = modo === "examen" ? "none" : "block";
  tiempoExamenConfig.style.display = modo === "examen" ? "block" : "none";
});

// --- INICIAR CUESTIONARIO ---
iniciarBtn.addEventListener("click", async () => {
  configDiv.style.display = "none";

  cuestionarioDiv.style.display = "none";
  resultadoDiv.style.display = "none";
  respuestasUsuario = [];
  puntaje = 0;
  indiceActual = 0;
  modoExamen = modoSelect.value === "examen";

  if (modoSelect.value === "tema" || modoExamen) {
    preguntas = await cargarJSON(temas[temaSelect.value]);
  } else {
    preguntas = [];
    for (let key in temas) {
      const data = await cargarJSON(temas[key]);
      const lista = Array.isArray(data) ? data : data.preguntas;
      preguntas.push(...lista.map(q => ({ ...q, tema: key })));
    }
  }

  preguntas = preguntas.sort(() => Math.random() - 0.5);

  const cantidad = parseInt(cantidadInput.value);
  if (!isNaN(cantidad) && cantidad > 0 && cantidad < preguntas.length) {
    preguntas = preguntas.slice(0, cantidad);
  }

  infoDiv.textContent =
    modoExamen
      ? `🧾 Modo examen | ${preguntas.length} preguntas`
      : `📋 Modo práctica | ${preguntas.length} preguntas`;

  tiempoInicio = Date.now();

  if (modoExamen) iniciarTemporizadorExamen();
  mostrarPregunta();
  cuestionarioDiv.style.display = "block";
});

async function cargarJSON(url) {
  const res = await fetch(url);
  return await res.json();
}

function mostrarPregunta() {
  const q = preguntas[indiceActual];
  preguntaEl.textContent = `(${indiceActual + 1}/${preguntas.length}) ${q.pregunta}`;
  opcionesEl.innerHTML = "";
  siguienteBtn.disabled = true;
  temporizadorEl.textContent = "";
  barraProgreso.style.transition = "width 0.3s ease-in-out";
  barraProgreso.style.width = `${(indiceActual / preguntas.length) * 100}%`;

  q.opciones.forEach((op, i) => {
    const btn = document.createElement("button");
    btn.textContent = op;
    btn.onclick = () => seleccionarRespuesta(i, q.respuesta);
    opcionesEl.appendChild(btn);
  });

  if (!modoExamen) iniciarTemporizadorPregunta();
}

function iniciarTemporizadorPregunta() {
  clearInterval(timer);
  const segundos = parseInt(tiempoInput.value);
  if (!isNaN(segundos) && segundos > 0) {
    tiempoRestante = segundos;
    temporizadorEl.textContent = `⏱️ ${tiempoRestante}s restantes`;
    timer = setInterval(() => {
      tiempoRestante--;
      temporizadorEl.textContent = `⏱️ ${tiempoRestante}s restantes`;
      if (tiempoRestante <= 0) {
        clearInterval(timer);
        seleccionarRespuesta(-1, preguntas[indiceActual].respuesta);
      }
    }, 1000);
  }
}

function iniciarTemporizadorExamen() {
  const minutos = parseInt(tiempoExamenInput.value);
  if (isNaN(minutos) || minutos <= 0) return;
  let totalSegundos = minutos * 60;

  timer = setInterval(() => {
    totalSegundos--;
    const m = Math.floor(totalSegundos / 60);
    const s = totalSegundos % 60;
    temporizadorEl.textContent = `⏳ Tiempo restante: ${m}:${s.toString().padStart(2, "0")}`;
    if (totalSegundos <= 0) {
      clearInterval(timer);
      mostrarResultado();
    }
  }, 1000);
}

function seleccionarRespuesta(i, correcta) {
  clearInterval(timer);
  const q = preguntas[indiceActual];
  respuestasUsuario.push({ pregunta: q.pregunta, correcta, seleccion: i, opciones: q.opciones });

  if (!modoExamen) {
    Array.from(opcionesEl.children).forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correcta) btn.classList.add("correcta");
      else if (idx === i) btn.classList.add("incorrecta");
    });
  }
  if (i === correcta) puntaje++;
  siguienteBtn.disabled = false;
}

siguienteBtn.addEventListener("click", () => {
  indiceActual++;
  if (indiceActual < preguntas.length) {
    if (!modoExamen) mostrarPregunta();
    else mostrarPregunta();
  } else {
    mostrarResultado();
  }
});

function mostrarResultado() {
  clearInterval(timer);
  cuestionarioDiv.style.display = "none";
  resultadoDiv.style.display = "block";
  barraProgreso.style.width = `100%`;

  const tiempoTotal = Math.floor((Date.now() - tiempoInicio) / 1000);
  const minutos = Math.floor(tiempoTotal / 60);
  const segundos = tiempoTotal % 60;
  tiempoFinalEl.textContent = `🕒 Tiempo usado: ${minutos}m ${segundos}s`;

  const porcentaje = ((puntaje / preguntas.length) * 100).toFixed(1);
  puntajeEl.textContent = `✅ Obtuviste ${puntaje}/${preguntas.length} (${porcentaje}%)`;

  resumenDiv.innerHTML = "<h3>📘 Revisión:</h3>";
  respuestasUsuario.forEach((r, idx) => {
    const cont = document.createElement("div");
    cont.className = "revision";
    const correcta = r.opciones[r.correcta];
    const seleccion = r.seleccion >= 0 ? r.opciones[r.seleccion] : "Sin responder";
    cont.innerHTML = `
      <<strong>${idx + 1}. [${r.tema || "General"}] ${r.pregunta}</strong><br>
      ✅ Correcta: ${correcta}<br>
      🧍 Tu respuesta: ${seleccion}
    `;
    if (r.correcta !== r.seleccion) cont.classList.add("fallada");
    resumenDiv.appendChild(cont);
  });
}

reintentarBtn.addEventListener("click", () => location.reload());
