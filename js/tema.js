// Se carga en <head> para aplicar el tema guardado antes de pintar (sin parpadeo).
(function () {
  try {
    var t = window.localStorage.getItem("tema");
    if (t === "claro" || t === "oscuro") document.documentElement.setAttribute("data-tema", t);
  } catch (e) { /* sin almacenamiento: sigue el tema del sistema */ }
})();
