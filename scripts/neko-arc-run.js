function lanzarRunner() {
    if (Math.random() < 0.15) {
      const runner = document.createElement("img");
      runner.src = "https://a181025l.github.io/Cuestionario/resources/images/arc-run.gif";
      runner.className = "runner";

      document.body.appendChild(runner);

      // Eliminar el elemento cuando termine la animación
      runner.addEventListener("animationend", () => {
        runner.remove();
      });
    }
  }

  // Intervalo de tiempo (ejemplo: cada 10 segundos)
  setInterval(lanzarRunner, 30000);