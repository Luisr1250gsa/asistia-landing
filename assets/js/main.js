/**
 * ASIST·IA — Landing Page · main.js
 * Funciones:
 * - scroll animations
 * - menú móvil
 * - CTA de planes hacia formulario
 * - formulario Formspree con plan dinámico
 * - smooth scroll
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
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  const cerrarMenu = () => {
    mainNav.classList.remove('abierto');
    menuToggle.classList.remove('activo');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('menu-open');
  };

  const abrirMenu = () => {
    mainNav.classList.add('abierto');
    menuToggle.classList.add('activo');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.classList.add('menu-open');
  };

  menuToggle.setAttribute('aria-expanded', 'false');

  menuToggle.addEventListener('click', () => {
    const abierto = mainNav.classList.contains('abierto');
    if (abierto) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  });

  mainNav.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener('click', (e) => {
      const href = enlace.getAttribute('href');
      if (!href || href.length < 2) return;

      const destino = document.querySelector(href);
      if (!destino) return;

      e.preventDefault();
      cerrarMenu();

      setTimeout(() => {
        destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 180);
    });
  });

  document.addEventListener('click', (e) => {
    const clickDentroMenu = mainNav.contains(e.target);
    const clickEnBoton = menuToggle.contains(e.target);

    if (!clickDentroMenu && !clickEnBoton && mainNav.classList.contains('abierto')) {
      cerrarMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('abierto')) {
      cerrarMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1180 && mainNav.classList.contains('abierto')) {
      cerrarMenu();
    }
  });
}


/* ============================================================
   CTA DE PLANES → FORMULARIO
   ============================================================ */
const planButtons = document.querySelectorAll('.plan-cta');
const selectedPlanText = document.getElementById('selected-plan-text');
const campoPlan = document.getElementById('campo-plan');
const campoAsunto = document.getElementById('campo-asunto');
const campoEmpleados = document.getElementById('campo-empleados');
const bloqueGuia = document.getElementById('guia');
const selectedPlanBox = document.getElementById('selected-plan-box');
const PLAN_POR_DEFECTO = 'Consulta general';
const ASUNTO_POR_DEFECTO = 'Solicitud ASIST·IA — Consulta general';

function actualizarPlanSeleccionado(plan, empleados, asunto) {
  const planFinal = plan || PLAN_POR_DEFECTO;
  const asuntoFinal = asunto || ASUNTO_POR_DEFECTO;

  if (selectedPlanText) {
    selectedPlanText.textContent = planFinal;
  }

  if (campoPlan) {
    campoPlan.value = planFinal;
  }

  if (campoAsunto) {
    campoAsunto.value = asuntoFinal;
  }

  if (campoEmpleados) {
    campoEmpleados.value = empleados || '';
  }

  if (selectedPlanBox) {
    selectedPlanBox.classList.remove('is-business', 'is-enterprise');

    const planNormalizado = planFinal.toLowerCase();

    if (planNormalizado.includes('business')) {
      selectedPlanBox.classList.add('is-business');
    } else if (planNormalizado.includes('enterprise')) {
      selectedPlanBox.classList.add('is-enterprise');
    }
  }
}

actualizarPlanSeleccionado(PLAN_POR_DEFECTO, '', ASUNTO_POR_DEFECTO);

planButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();

    const plan = btn.dataset.plan || PLAN_POR_DEFECTO;
    const empleados = btn.dataset.empleados || '';
    const asunto = btn.dataset.asunto || ASUNTO_POR_DEFECTO;

    actualizarPlanSeleccionado(plan, empleados, asunto);

    if (bloqueGuia) {
      bloqueGuia.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   FORMULARIO DE DESCARGA — FORMSPREE
   ============================================================ */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgopprbo';

const formulario = document.getElementById('formulario-descarga');
const mensajeOk = document.getElementById('form-mensaje-ok');
const btnEnviar = formulario ? formulario.querySelector('button[type="submit"]') : null;

if (formulario && btnEnviar) {
  const textoOriginalBtn = btnEnviar.innerHTML;

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreInput = formulario.querySelector('#campo-nombre');
    const emailInput = formulario.querySelector('#campo-email');
    const empleadosInput = formulario.querySelector('#campo-empleados');
    const planInput = formulario.querySelector('#campo-plan');
    const asuntoInput = formulario.querySelector('#campo-asunto');

    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const empleados = empleadosInput ? empleadosInput.value : '';
    const plan = planInput ? planInput.value : PLAN_POR_DEFECTO;
    const asunto = asuntoInput ? asuntoInput.value : ASUNTO_POR_DEFECTO;

    limpiarError();

    if (!nombre || !email || !empleados) {
      mostrarError('Por favor, completa todos los campos antes de continuar.');
      return;
    }

    if (!validarEmail(email)) {
      mostrarError('Introduce un email corporativo válido.');
      return;
    }

    activarEstadoCarga();

    try {
      const respuesta = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre,
          email,
          empleados,
          plan,
          _subject: asunto
        })
      });

      if (respuesta.ok) {
        formulario.classList.add('form-hide');

        setTimeout(() => {
          formulario.style.display = 'none';

          if (mensajeOk) {
            mensajeOk.style.display = 'flex';
            mensajeOk.classList.remove('success-show');
            void mensajeOk.offsetWidth;
            mensajeOk.classList.add('success-show');
          }
        }, 320);
      } else {
        let msg = 'Error al enviar. Inténtalo de nuevo.';

        try {
          const datos = await respuesta.json();
          if (datos.errors && Array.isArray(datos.errors)) {
            msg = datos.errors.map((error) => error.message).join(', ');
          }
        } catch (_) {}

        mostrarError(msg);
        restaurarBoton();
      }
    } catch (error) {
      mostrarError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
      restaurarBoton();
    }
  });

  function activarEstadoCarga() {
    btnEnviar.disabled = true;
    btnEnviar.classList.add('is-loading');
    btnEnviar.innerHTML = `
      <span class="btn-spinner" aria-hidden="true"></span>
      <span>Enviando…</span>
    `;
  }

  function restaurarBoton() {
    btnEnviar.disabled = false;
    btnEnviar.classList.remove('is-loading');
    btnEnviar.innerHTML = textoOriginalBtn;
  }
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarError(msg) {
  if (!formulario || !btnEnviar) return;

  let errorEl = formulario.querySelector('.form-error-msg');

  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.className = 'form-error-msg';
    btnEnviar.insertAdjacentElement('afterend', errorEl);
  }

  errorEl.textContent = msg;
}

function limpiarError() {
  if (!formulario) return;

  const errorEl = formulario.querySelector('.form-error-msg');
  if (errorEl) {
    errorEl.remove();
  }
}


/* ============================================================
   SMOOTH SCROLL PARA ENLACES ANCLA FUERA DEL MENÚ MÓVIL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
  if (mainNav && mainNav.contains(enlace)) return;
  if (enlace.classList.contains('plan-cta')) return;

  const href = enlace.getAttribute('href');
  if (!href || href.length < 2) return;

  enlace.addEventListener('click', (e) => {
    const destino = document.querySelector(href);

    if (destino) {
      e.preventDefault();
      destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});