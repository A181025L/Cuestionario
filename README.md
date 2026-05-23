# Cuestionario de Práctica

Este proyecto carga preguntas desde archivos JSON dentro de la carpeta `data/` y las organiza desde las constantes definidas en `script.js`.

## Estructura del proyecto

```text
/
├── index.html
│
├── data/
│   ├── acuerdo_001.json
│   ├── radicacion.json
│   ├── acuerdo_060.json
│   ├── prestamo.json
│   ├── manual_correspondencia.json
│   └── ...
│
├── resources/
│   ├── sound/
│   │   └── time-out.mp3
│   │
│   └── images/
│       ├── arc-run.gif
│       └── wip-arc.jpeg
│
├── scripts/
│   ├── script.js
│   └── neko-arc-run.js
│
├── styles/
│   └── style.css
│
└── README.md
```

## Dónde guardar las preguntas

Cada tema debe guardarse en un archivo `.json` dentro de `data/`.

En `script.js`, la constante `temas` conecta una clave con la ruta del archivo:

```js
const temas = {
  acuerdo_001: "data/acuerdo_001.json",
  radicacion: "data/radicacion.json"
};
```

La clave del tema es la que luego se usa dentro de `materias`.

---

## Cómo se organizan las preguntas

El sistema trabaja con una lista de objetos. El cargador también acepta un objeto con la propiedad `preguntas`, así que ambos formatos sirven:

### Opción 1: arreglo directo
```json
[
  {
    "tipo": "multiple",
    "pregunta": "¿Cuál es la respuesta correcta?",
    "opciones": ["A", "B", "C", "D"],
    "respuesta": 1,
    "explicacion": "La respuesta correcta es la opción B."
  }
]
```

### Opción 2: objeto con `preguntas`
```json
{
  "preguntas": [
    {
      "tipo": "multiple",
      "pregunta": "¿Cuál es la respuesta correcta?",
      "opciones": ["A", "B", "C", "D"],
      "respuesta": 1
    }
  ]
}
```

Si una pregunta no trae `tipo`, el sistema la toma como `multiple`.

---

## Tipos de pregunta soportados

En `script.js`, la constante `TIPOS` define los tipos disponibles:

```js
const TIPOS = {
  multiple:        { label: "Opción múltiple",   icon: "☑️" },
  verdadero_falso: { label: "Verdadero / Falso", icon: "⚖️" },
  completar:       { label: "Completar",         icon: "✏️" },
  arrastrar:       { label: "Relacionar",        icon: "🔗" }
};
```

### 1) Opción múltiple

```json
{
  "tipo": "multiple",
  "pregunta": "¿Cuál de las siguientes opciones es correcta?",
  "opciones": ["Respuesta 1", "Respuesta 2", "Respuesta 3", "Respuesta 4"],
  "respuesta": 2,
  "explicacion": "La opción correcta es la tercera."
}
```

**Campos:**
- `pregunta`: texto de la pregunta.
- `opciones`: arreglo de opciones.
- `respuesta`: índice de la opción correcta (empieza en `0`).
- `explicacion` (opcional): texto que se muestra al responder.

---

### 2) Verdadero / Falso

```json
{
  "tipo": "verdadero_falso",
  "pregunta": "La gestión documental organiza la información.",
  "respuesta": 0,
  "explicacion": "Verdadero, porque permite clasificar y controlar documentos."
}
```

**Regla:**
- `respuesta = 0` → Verdadero
- `respuesta = 1` → Falso

> Aunque el sistema genera los botones automáticamente, el dato se guarda como índice numérico.

---

### 3) Completar

```json
{
  "tipo": "completar",
  "pregunta": "La norma que regula el archivo es la ________.",
  "respuesta": "Ley General de Archivos",
  "alternativas": ["ley general de archivos", "Ley 594 de 2000"],
  "explicacion": "También se conoce como Ley 594 de 2000."
}
```

**Campos:**
- `respuesta`: texto exacto esperado.
- `alternativas` (opcional): respuestas válidas adicionales.
- La comparación ignora mayúsculas y espacios extra.

---

### 4) Relacionar / Arrastrar

```json
{
  "tipo": "arrastrar",
  "pregunta": "Relaciona cada término con su definición.",
  "pares": [
    { "termino": "Archivo", "definicion": "Conjunto organizado de documentos." },
    { "termino": "Radicación", "definicion": "Ingreso y registro de documentos." },
    { "termino": "Serie documental", "definicion": "Conjunto de documentos con características similares." }
  ],
  "explicacion": "Cada término debe ir en su definición correcta."
}
```

**Campos:**
- `pares`: arreglo de objetos.
- Cada objeto debe tener:
  - `termino`
  - `definicion`

El orden de los términos se mezcla al mostrar la pregunta.

---

## Campos recomendados para cualquier pregunta

Puedes usar estos campos cuando haga falta:

- `tipo`
- `pregunta`
- `explicacion`
- `opciones` (solo en `multiple`)
- `respuesta`
- `alternativas` (solo en `completar`)
- `pares` (solo en `arrastrar`)

---

## Cómo agregar un nuevo tema

1. Crea el archivo JSON dentro de `data/`.
2. Agrega la ruta en `temas`.
3. Agrega la clave del tema dentro de la materia correspondiente en `materias`.

### Ejemplo

```js
const temas = {
  acuerdo_001: "data/acuerdo_001.json",
  nuevo_tema: "data/nuevo_tema.json"
};
```

Y luego en la materia:

```js
const materias = {
  gestion_documental: {
    nombre: "Gestión Documental",
    icono: "📁",
    color: "#00ffc3",
    temas: {
      acuerdo_001: "Acuerdo 001 de 2024 – AGN",
      nuevo_tema: "Nuevo tema"
    }
  }
};
```

---

## Cómo agregar una nueva materia

Dentro de `materias`, copia una estructura similar a esta:

```js
const materias = {
  nueva_materia: {
    nombre: "Nombre de la Materia",
    icono: "📖",
    color: "#ffbe00",
    temas: {
      clave_tema: "Nombre visible del tema"
    }
  }
};
```

**Importante:**
- La clave del tema debe existir en `temas`.
- El texto visible es el nombre que verá el usuario.
- Puedes usar `icono` y `color` para personalizar la tarjeta.

---

## Cómo agregar un nuevo tipo de pregunta

El sistema usa `TIPOS` para mostrar el nombre e ícono del tipo y luego una función de render por tipo.

### Paso 1: añadir el tipo en `TIPOS`

```js
const TIPOS = {
  multiple: { label: "Opción múltiple", icon: "☑️" },
  nuevo_tipo: { label: "Mi tipo nuevo", icon: "🆕" }
};
```

### Paso 2: crear su renderizado

En `mostrarPregunta()` debes agregar el caso:

```js
const renderFn = {
  multiple: () => renderMultiple(q),
  verdadero_falso: () => renderVerdaderoFalso(q),
  completar: () => renderCompletar(q),
  arrastrar: () => renderArrastrar(q),
  nuevo_tipo: () => renderNuevoTipo(q)
};
```

### Paso 3: crear su verificación y guardar la respuesta

Debes registrar la respuesta con `registrarRespuesta(...)` y dejar `siguienteBtn.disabled = false` cuando la pregunta ya se haya contestado.

---

## Cómo funciona la carga de preguntas

Cuando el usuario inicia el cuestionario, el script lee los archivos JSON desde `data/`, normaliza las preguntas y les agrega metadatos internos como:
- `_tema`
- `_materia`

Eso permite mostrar después de qué materia y tema salió cada pregunta en la revisión final.

---

## Recomendaciones

- Mantén las claves en minúsculas y sin espacios.
- Usa nombres de archivo cortos y claros.
- Verifica que la ruta en `temas` coincida exactamente con el archivo real.
- Asegúrate de que cada pregunta tenga el formato correcto según su tipo.
- Si una pregunta no define `tipo`, se tratará como `multiple`.

---

## Ejemplo completo de archivo JSON

```json
{
  "preguntas": [
    {
      "tipo": "multiple",
      "pregunta": "¿Qué es una serie documental?",
      "opciones": [
        "Un documento único",
        "Un conjunto de documentos",
        "Un formato de archivo",
        "Una norma"
      ],
      "respuesta": 1,
      "explicacion": "Una serie documental agrupa documentos con características comunes."
    },
    {
      "tipo": "verdadero_falso",
      "pregunta": "La radicación consiste en registrar el ingreso de un documento.",
      "respuesta": 0
    },
    {
      "tipo": "completar",
      "pregunta": "El archivo debe conservarse con ________.",
      "respuesta": "orden",
      "alternativas": ["organización"]
    },
    {
      "tipo": "arrastrar",
      "pregunta": "Relaciona los términos con su definición.",
      "pares": [
        { "termino": "Archivo", "definicion": "Lugar o sistema donde se conservan documentos." },
        { "termino": "Radicación", "definicion": "Registro de entrada de un documento." }
      ]
    }
  ]
}
```

---

## Nota técnica

En `script.js`, las preguntas se cargan desde las rutas declaradas en `temas`, se agrupan por `materias` y se muestran según el modo elegido por el usuario. El proyecto ya trae soporte para practicar por tema, por materia, en modo todos y en modo examen.
