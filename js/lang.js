const LANGUAGES = {
  es: {
    name: "Vicente Köhler",
    degree: "Ing. Civil Industrial / Ing. Civil Informático - UAI",
    bio: "Estudiante de doble titulación en Ingeniería Civil Industrial e Ingeniería Civil Informática en la UAI, con fuerte interés en consultoría tecnológica, desarrollo web y análisis de datos. Me destaco por mi adaptabilidad, pensamiento crítico y motivación por resolver problemas reales con impacto.",
    quote: "\"No busco respuestas fáciles, busco las correctas.\"",
    cv_es: "CV en Español",
    cv_en: "CV en Inglés",
    contact: "Guardar contacto",
    location: "Santiago, Chile"
  },
  en: {
    name: "Vicente Köhler",
    degree: "Industrial and Computer Science Engineering Student - UAI",
    bio: "Double-degree student in Industrial and Computer Science Engineering at UAI, with a strong interest in tech consulting, web development, and data analysis. I stand out for my adaptability, critical thinking, and drive to solve real-world impactful problems.",
    quote: "\"I don't seek easy answers, I seek the right ones.\"",
    cv_es: "CV in Spanish",
    cv_en: "CV in English",
    contact: "Save contact",
    location: "Santiago, Chile"
  }
};

function cambiarIdioma(lang) {
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  const dict = LANGUAGES[lang];
  document.querySelectorAll('[data-lang="name"]').forEach(el => el.textContent = dict.name);
  document.querySelectorAll('[data-lang="degree"]').forEach(el => el.textContent = dict.degree);
  document.querySelectorAll('[data-lang="bio"]').forEach(el => el.textContent = dict.bio);
  document.querySelectorAll('[data-lang="quote"]').forEach(el => el.textContent = dict.quote);
  document.querySelectorAll('[data-lang="cv_es"]').forEach(el => el.textContent = dict.cv_es);
  document.querySelectorAll('[data-lang="cv_en"]').forEach(el => el.textContent = dict.cv_en);
  document.querySelectorAll('[data-lang="contact"]').forEach(el => el.textContent = dict.contact);
  document.querySelectorAll('[data-lang="location"]').forEach(el => el.textContent = dict.location);
}

window.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('lang') || 'es';
  cambiarIdioma(savedLang);

  document.querySelectorAll('.lang-flag').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      cambiarIdioma(lang);

      // Actualiza el ícono de la bandera
      const flag = document.getElementById('currentFlag');
      if (flag) {
        flag.src = lang === 'es' ? 'assets/es.png' : 'assets/gb.png';
      }
    });
  });
});
