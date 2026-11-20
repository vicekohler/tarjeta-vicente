// Idioma, tema y copiar. Sin dependencias externas. El español está escrito en el HTML
// (así la página se lee completa aunque este archivo no cargue); aquí solo va el inglés.
(function () {
  "use strict";

  var EN = {
    carrera: "Industrial Engineering + Computer Science Engineering · UAI",
    busco: "Looking for a 2027 internship · operations, data or technology",
    guardar: "Save contact",
    cv_es: "CV ES",
    cv_en: "CV EN",
    t_sobre: "About me",
    sobre: "Bachelor of Engineering Sciences (UAI), in the final semester of a double degree in Industrial and Computer Science Engineering. I like connecting processes and technology: understanding how an operation works and building the tool that improves it.",
    t_proyectos: "Projects",
    p1_meta: "Startup · 2026",
    p1: "SaaS platform that centralizes a company's software licenses, detects redundancies and helps cut spending.",
    p2_meta: "Personal project · 2026",
    p2_titulo: "AI agent system",
    p2: "Agents that sort my email, schedule deadlines and prepare drafts, with their own security layer and a Python desktop app.",
    p3_meta: "Academic project · 2026",
    p3_titulo: "Price monitor",
    p3: "Scraping and price analysis for pharmacies and supermarkets in Chile; the MVP processed the full catalog of 3 pharmacies.",
    p4_meta: "Consulting · 2025",
    p4_titulo: "Odoo ERP implementation",
    p4: "Migration strategy for inventory, logistics and financial control; requirements with 8 stakeholders and 4 process improvements.",
    t_habilidades: "Skills",
    h1: "Operations",
    h2: "Supply chain",
    h3: "Data analysis",
    h4: "Project evaluation",
    h5: "English B2",
    t_contacto: "Contact",
    copiar: "Copy",
    abrir: "Open",
    frase: "\"I don't look for easy answers, I look for the right ones.\"",
    copiado: "Copied",
    no_copiado: "Couldn't copy: select it by hand",
    tema: "Change theme",
    compartir: "Share card",
    enlace_copiado: "Link copied"
  };
  var ES_EXTRA = { copiado: "Copiado", no_copiado: "No se pudo copiar: selecciónalo a mano", tema: "Cambiar tema", compartir: "Compartir tarjeta", enlace_copiado: "Enlace copiado" };

  // localStorage puede no existir o lanzar error (Safari privado, cookies bloqueadas).
  function leer(clave) { try { return window.localStorage.getItem(clave); } catch (e) { return null; } }
  function guardar(clave, valor) { try { window.localStorage.setItem(clave, valor); } catch (e) { /* sin memoria, no pasa nada */ } }

  var nodos = Array.prototype.slice.call(document.querySelectorAll("[data-t]"));
  var ES = {};
  nodos.forEach(function (n) { ES[n.getAttribute("data-t")] = n.textContent; });
  Object.keys(ES_EXTRA).forEach(function (k) { ES[k] = ES_EXTRA[k]; });
  var idioma = "es";

  function texto(clave) { return (idioma === "en" ? EN : ES)[clave] || ES[clave] || ""; }

  function ponerIdioma(nuevo) {
    idioma = nuevo === "en" ? "en" : "es";
    document.documentElement.lang = idioma;
    nodos.forEach(function (n) {
      var t = texto(n.getAttribute("data-t"));
      if (t) n.textContent = t;
    });
    document.querySelectorAll("[data-idioma]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-idioma") === idioma));
    });
    var tema = document.getElementById("tema");
    if (tema) tema.setAttribute("aria-label", texto("tema"));
    var comp = document.getElementById("compartir");
    if (comp) comp.setAttribute("aria-label", texto("compartir"));
  }

  document.querySelectorAll("[data-idioma]").forEach(function (b) {
    b.addEventListener("click", function () {
      ponerIdioma(b.getAttribute("data-idioma"));
      guardar("idioma", idioma);
    });
  });
  var navegador = (navigator.language || "es").toLowerCase();
  ponerIdioma(leer("idioma") || (navegador.indexOf("es") === 0 ? "es" : "en"));

  // Tema: sigue al sistema hasta que la persona elige; después recuerda la elección.
  var raiz = document.documentElement;
  var temaGuardado = leer("tema");
  if (temaGuardado === "claro" || temaGuardado === "oscuro") raiz.setAttribute("data-tema", temaGuardado);
  function temaActual() {
    var fijo = raiz.getAttribute("data-tema");
    if (fijo) return fijo;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
  }
  function pintarColorBarra() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", temaActual() === "oscuro" ? "#121110" : "#f4eee3");
  }
  pintarColorBarra();
  var botonTema = document.getElementById("tema");
  if (botonTema) botonTema.addEventListener("click", function () {
    var nuevo = temaActual() === "oscuro" ? "claro" : "oscuro";
    raiz.setAttribute("data-tema", nuevo);
    guardar("tema", nuevo);
    pintarColorBarra();
  });

  // Copiar con respaldo para navegadores sin portapapeles moderno.
  var aviso = document.getElementById("aviso");
  var temporizador = null;
  function avisar(mensaje) {
    if (!aviso) return;
    aviso.textContent = mensaje;
    aviso.classList.add("visible");
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { aviso.classList.remove("visible"); }, 1600);
  }
  function copiarRespaldo(valor) {
    var area = document.createElement("textarea");
    area.value = valor;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }
  // Compartir: menú nativo del celular; si no existe, copia el enlace.
  var URL_TARJETA = "https://vicekohler.github.io/tarjeta-vicente/";
  var botonCompartir = document.getElementById("compartir");
  if (botonCompartir) botonCompartir.addEventListener("click", function () {
    var datos = { title: "Vicente Köhler", text: texto("busco"), url: URL_TARJETA };
    if (navigator.share) {
      navigator.share(datos).catch(function () { /* la persona cerró el menú */ });
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(URL_TARJETA).then(
        function () { avisar(texto("enlace_copiado")); },
        function () { avisar(copiarRespaldo(URL_TARJETA) ? texto("enlace_copiado") : texto("no_copiado")); }
      );
    } else {
      avisar(copiarRespaldo(URL_TARJETA) ? texto("enlace_copiado") : texto("no_copiado"));
    }
  });

  document.querySelectorAll("button[data-copiar]").forEach(function (b) {
    b.addEventListener("click", function () {
      var valor = b.getAttribute("data-copiar");
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(valor).then(
          function () { avisar(texto("copiado")); },
          function () { avisar(copiarRespaldo(valor) ? texto("copiado") : texto("no_copiado")); }
        );
      } else {
        avisar(copiarRespaldo(valor) ? texto("copiado") : texto("no_copiado"));
      }
    });
  });
})();
