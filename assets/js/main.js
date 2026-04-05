/**
 * ASIST·IA — Landing Page · main.js
 * Funciones: scroll animations, menú móvil, formulario, smooth scroll
 */

/* ============================================================
   ANIMACIONES DE ENTRADA AL HACER SCROLL
   ============================================================ */
const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada, i) => {
      if (entrada.isIntersecting) {
        setTimeout(() => {
          entrada.target.classList.add('visible');
        }, i * 80);
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.fade-up').forEach((el) => observador.observe(el));

/* ============================================================
   MENÚ MÓVIL
   ============================================================ */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const abierto = navLinks.classList.toggle('abierto');
    navToggle.setAttribute('aria-expanded', abierto);
    navToggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cerrar al hacer clic en un enlace
  navLinks.querySelectorAll('a').forEach((enlace) => {
    enlace.addEventListener('click', () => {
      navLinks.classList.remove('abierto');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ============================================================
   FORMULARIO DE DESCARGA
   ============================================================ */
const formulario = document.getElementById('formulario-descarga');
const mensajeOk  = document.getElementById('form-mensaje-ok');

if (formulario) {
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre   = formulario.querySelector('#campo-nombre').value.trim();
    const email    = formulario.querySelector('#campo-email').value.trim();
    const empleados = formulario.querySelector('#campo-empleados').value;

    // Validación básica
    if (!nombre || !email || !empleados) {
      alert('Por favor, completa todos los campos antes de continuar.');
      return;
    }

    if (!validarEmail(email)) {
      alert('Introduce un email corporativo válido.');
      return;
    }

    // Aquí irá la integración con el backend o servicio de email
    console.log('Solicitud de descarga:', { nombre, email, empleados });

    // Mostrar confirmación
    formulario.style.display = 'none';
    if (mensajeOk) mensajeOk.style.display = 'flex';
  });
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   SMOOTH SCROLL PARA ENLACES ANCLA
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
  enlace.addEventListener('click', (e) => {
    const destino = document.querySelector(enlace.getAttribute('href'));
    if (destino) {
      e.preventDefault();
      destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   BOTONES "SOLICITAR INFORMACIÓN" → REDIRIGEN AL EMAIL
   ============================================================ */
document.querySelectorAll('.btn-solicitar').forEach((btn) => {
  btn.addEventListener('click', () => {
    const plan = btn.dataset.plan || 'plan no especificado';
    const asunto = encodeURIComponent(`Solicitud de información — ${plan}`);
    const cuerpo = encodeURIComponent(
      `Hola,\n\nMe interesa obtener más información sobre el plan ${plan} de ASIST·IA.\n\nNombre:\nEmpresa:\nNº de empleados:\n\nGracias.`
    );
    window.location.href = `mailto:AsesoramientoAsistia@outlook.es?subject=${asunto}&body=${cuerpo}`;
  });
});

/* ============================================================
   PLAN ENTERPRISE → EMAIL A GERENCIA
   ============================================================ */
document.querySelectorAll('.btn-enterprise').forEach((btn) => {
  btn.addEventListener('click', () => {
    const asunto = encodeURIComponent('Consulta Enterprise — ASIST·IA');
    const cuerpo = encodeURIComponent(
      'Hola,\n\nMe gustaría recibir información sobre el plan Enterprise de ASIST·IA.\n\nNombre:\nEmpresa:\nNº de empleados:\nNecesidades específicas:\n\nGracias.'
    );
    window.location.href = `mailto:asistia.web@outlook.com?subject=${asunto}&body=${cuerpo}`;
  });
});
