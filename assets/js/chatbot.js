(function () {
  const launcher = document.getElementById('aiasistia-launcher');
  const windowEl = document.getElementById('aiasistia-window');
  const closeBtn = document.getElementById('aiasistia-close');
  const voiceToggle = document.getElementById('aiasistia-voice-toggle');
  const messagesEl = document.getElementById('aiasistia-messages');
  const actionsEl = document.getElementById('aiasistia-quick-actions');
  const widgetEl = document.getElementById('aiasistia-chatbot');

  if (!launcher || !windowEl || !closeBtn || !messagesEl || !actionsEl || !widgetEl) return;

  const EMAIL_ASESORAMIENTO = 'mailto:AsesoramientoAsistia@outlook.es';
  const EMAIL_TECNICO = 'mailto:asistia.web@outlook.com';
  const GUIA_URL = '#guia';

  let voiceEnabled = true;
  let currentAudio = null;

  const isTabletViewport = () =>
    window.matchMedia('(min-width: 761px) and (max-width: 1180px)').matches;

  const FAQS = {
    problema: {
      question: '¿Qué puede solucionar ASIST·IA en mi empresa?',
      answer: [
        'ASIST·IA te ayuda a ordenar el control horario, centralizar solicitudes internas y ganar una visión operativa más clara del día a día.',
        'La propuesta está pensada para empresas que quieren reducir fricción administrativa, mejorar trazabilidad y profesionalizar procesos sin perder capacidad de adaptación.'
      ],
      actions: ['diferencia', 'crecimiento', 'cta_demo']
    },
    diferencia: {
      question: '¿Qué diferencia a ASIST·IA de otras soluciones?',
      answer: [
        'ASIST·IA no se plantea como un simple sistema de fichaje.',
        'Se posiciona como una base tecnológica con criterio de negocio, preparada para aportar control, lectura operativa y evolución real según la necesidad de cada empresa.',
        'Detrás no hay una propuesta genérica, sino una visión orientada a procesos, seguridad y personalización.'
      ],
      actions: ['personalizacion', 'stack', 'cta_asesoramiento']
    },
    stack: {
      question: '¿Qué stack tecnológico utiliza?',
      answer: [
        'ASIST·IA está construido sobre una base moderna y estable, preparada para crecer con garantías técnicas y operativas.'
      ],
      bullets: [
        'ASP.NET Core 8',
        'Blazor WebAssembly',
        'SignalR',
        'QuestPDF',
        'SQL Server',
        'Docker'
      ],
      actions: ['crecimiento', 'seguridad', 'cta_tecnico']
    },
    seguridad: {
      question: '¿Es una aplicación segura a nivel de ciberseguridad?',
      answer: [
        'Sí. ASIST·IA se ha trabajado con un enfoque serio de ciberseguridad, incorporando revisiones de seguridad y una capa adicional de autenticación mediante Google Authenticator.',
        'Esa verificación basada en códigos temporales TOTP añade una protección adicional al acceso y refuerza el nivel de control sobre la autenticación.'
      ],
      actions: ['stack', 'diferencia', 'cta_tecnico']
    },
    personalizacion: {
      question: '¿Se puede personalizar para mi empresa?',
      answer: [
        'Sí. Uno de los pilares del proyecto es evolucionar hacia una plataforma configurable según la operativa real de cada cliente.',
        'Eso permite adaptar módulos, flujos y estructura de uso en función de necesidades concretas, con una lógica mucho más cercana al negocio.'
      ],
      actions: ['tipo_empresa', 'demo', 'cta_asesoramiento']
    },
    crecimiento: {
      question: '¿Está preparado para crecer con mi negocio?',
      answer: [
        'Sí. La base de ASIST·IA está planteada para acompañar crecimiento, complejidad operativa y necesidades futuras de personalización.',
        'La visión no termina en el control horario: apunta a una plataforma más amplia, sólida y progresivamente adaptada a cada empresa.'
      ],
      actions: ['stack', 'personalizacion', 'cta_demo']
    },
    tipo_empresa: {
      question: '¿Qué tipo de empresas pueden usarlo?',
      answer: [
        'ASIST·IA puede encajar tanto en equipos pequeños como en organizaciones con una estructura más compleja.',
        'Lo determinante no es solo el tamaño, sino la necesidad de ordenar operativa, mejorar control y trabajar con una solución preparada para evolucionar.'
      ],
      actions: ['personalizacion', 'demo', 'cta_info']
    },
    demo: {
      question: '¿Cómo puedo verlo en funcionamiento?',
      answer: [
        'Puedes solicitar una demo o pedir asesoramiento directo para revisar el encaje de ASIST·IA en tu empresa.',
        'Si tu prioridad es valorar operativa, personalización o enfoque técnico, el siguiente paso natural es una conversación guiada.'
      ],
      actions: ['cta_demo', 'cta_email', 'inicio']
    }
  };

  const CTA_MAP = {
    cta_demo: {
      label: 'Solicitar demo',
      type: 'link',
      href: GUIA_URL,
      primary: true
    },
    cta_info: {
      label: 'Solicitar información',
      type: 'link',
      href: GUIA_URL,
      primary: true
    },
    cta_asesoramiento: {
      label: 'Solicitar asesoramiento',
      type: 'link',
      href: EMAIL_ASESORAMIENTO,
      primary: true
    },
    cta_tecnico: {
      label: 'Contacto técnico',
      type: 'link',
      href: EMAIL_TECNICO,
      primary: false
    },
    cta_email: {
      label: 'Enviar email',
      type: 'link',
      href: EMAIL_ASESORAMIENTO,
      primary: false
    },
    inicio: {
      label: 'Volver a preguntas',
      type: 'callback',
      action: 'renderStart',
      primary: false
    }
  };

  const AUDIO_MAP = {
    welcome: 'welcome.mp3',
    problema: 'problema.mp3',
    diferencia: 'diferencia.mp3',
    stack: 'stack.mp3',
    seguridad: 'seguridad.mp3',
    personalizacion: 'personalizacion.mp3',
    crecimiento: 'crecimiento.mp3',
    tipo_empresa: 'tipo-empresa.mp3',
    demo: 'demo.mp3'
  };

  const QUICK_QUESTIONS = [
    'problema',
    'diferencia',
    'stack',
    'seguridad',
    'personalizacion',
    'crecimiento',
    'tipo_empresa',
    'demo'
  ];

  function stopAudio() {
    if (!currentAudio) return;
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  function playAudio(audioKey) {
    if (!voiceEnabled || !audioKey) return;

    const fileName = AUDIO_MAP[audioKey];
    if (!fileName) return;

    stopAudio();

    const audio = new Audio(`./assets/audio/chatbot/${fileName}`);
    audio.volume = 1;
    currentAudio = audio;

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        if (currentAudio === audio) {
          currentAudio = null;
        }
      });
    }

    audio.addEventListener('ended', () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
    });

    audio.addEventListener('error', () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
    });
  }

  function clearChatState() {
    stopAudio();
    messagesEl.innerHTML = '';
    actionsEl.innerHTML = '';
  }

  function updateVoiceButton() {
    if (!voiceToggle) return;

    if (voiceEnabled) {
      voiceToggle.classList.add('is-active');
      voiceToggle.setAttribute('aria-label', 'Desactivar lectura por voz');
      voiceToggle.setAttribute('title', 'Lectura por voz activa');
    } else {
      voiceToggle.classList.remove('is-active');
      voiceToggle.setAttribute('aria-label', 'Activar lectura por voz');
      voiceToggle.setAttribute('title', 'Lectura por voz desactivada');
    }
  }

  function openChat() {
    windowEl.hidden = false;
    windowEl.classList.remove('is-open');
    void windowEl.offsetWidth;
    windowEl.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');

    if (!messagesEl.childElementCount) {
      renderWelcome();
    }

    setTimeout(scrollToBottom, 60);
  }

  function closeChat() {
    clearChatState();
    windowEl.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function createMessage(role, label, contentBuilder) {
    const wrapper = document.createElement('div');
    wrapper.className = `aiasistia-message ${role}`;

    const labelEl = document.createElement('div');
    labelEl.className = 'aiasistia-label';
    labelEl.textContent = label;

    const bubble = document.createElement('div');
    bubble.className = 'aiasistia-bubble';

    contentBuilder(bubble);

    wrapper.appendChild(labelEl);
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    scrollToBottom();

    return bubble;
  }

  function addUserMessage(text) {
    createMessage('user', 'Consulta', (bubble) => {
      const p = document.createElement('p');
      p.textContent = text;
      bubble.appendChild(p);
    });
  }

  function addBotMessage(block, audioKey = null) {
    createMessage('bot', 'AI ASISTIA', (bubble) => {
      (block.answer || []).forEach((paragraph) => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        bubble.appendChild(p);
      });

      if (block.bullets && block.bullets.length) {
        const ul = document.createElement('ul');
        ul.className = 'aiasistia-bullet-list';

        block.bullets.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        });

        bubble.appendChild(ul);
      }

      if (block.inlineLinks && block.inlineLinks.length) {
        const linksWrap = document.createElement('div');
        linksWrap.className = 'aiasistia-inline-links';

        block.inlineLinks.forEach((linkItem) => {
          const a = document.createElement('a');
          a.className = 'aiasistia-inline-link';
          a.href = linkItem.href;
          a.textContent = linkItem.label;

          if (linkItem.href.startsWith('mailto:')) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }

          linksWrap.appendChild(a);
        });

        bubble.appendChild(linksWrap);
      }
    });

    playAudio(audioKey);
  }

  function clearActions() {
    actionsEl.innerHTML = '';
  }

  function renderActions(actionKeys) {
    clearActions();

    actionKeys.forEach((key) => {
      const faq = FAQS[key];
      const cta = CTA_MAP[key];

      if (faq) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'aiasistia-action';
        button.textContent = faq.question;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          handleFaq(key);
        });
        actionsEl.appendChild(button);
        return;
      }

      if (cta) {
        if (cta.type === 'link') {
          const a = document.createElement('a');
          a.className = `aiasistia-action${cta.primary ? ' is-primary' : ''}`;
          a.textContent = cta.label;
          a.href = cta.href;

          if (cta.href.startsWith('mailto:')) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }

          a.addEventListener('click', (event) => {
            event.stopPropagation();
          });

          actionsEl.appendChild(a);
          return;
        }

        if (cta.type === 'callback' && cta.action === 'renderStart') {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'aiasistia-action';
          button.textContent = cta.label;
          button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            renderStart();
          });
          actionsEl.appendChild(button);
        }
      }
    });

    scrollToBottom();
  }

  function renderWelcome() {
    addBotMessage({
      answer: [
        'Hola. Soy AI ASISTIA, el asistente consultivo de la plataforma.',
        'Puedo ayudarte a entender qué valor puede aportar ASIST·IA a tu empresa en control, trazabilidad, seguridad, personalización y evolución operativa.',
        'Puedes empezar por una de estas preguntas estratégicas.'
      ]
    }, 'welcome');

    renderActions(QUICK_QUESTIONS);
  }

  function renderStart() {
    addBotMessage({
      answer: [
        'Perfecto. Retomamos la conversación desde aquí. Elige la cuestión que quieras analizar y continúo.'
      ]
    }, 'welcome');

    renderActions(QUICK_QUESTIONS);
  }

  function handleFaq(key) {
    const block = FAQS[key];
    if (!block) return;

    addUserMessage(block.question);

    const inlineLinks = [];
    if (key === 'demo') {
      inlineLinks.push(
        { label: 'Ir al formulario', href: GUIA_URL },
        { label: 'Enviar email', href: EMAIL_ASESORAMIENTO }
      );
    }

    addBotMessage({
      answer: block.answer,
      bullets: block.bullets || [],
      inlineLinks
    }, key);

    renderActions(block.actions || QUICK_QUESTIONS);
  }

  launcher.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (windowEl.hidden) {
      openChat();
    } else {
      closeChat();
    }
  });

  closeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeChat();
  });

  if (voiceToggle) {
    voiceToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      voiceEnabled = !voiceEnabled;

      if (!voiceEnabled) {
        stopAudio();
      }

      updateVoiceButton();
    });
  }

  windowEl.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  windowEl.addEventListener('touchstart', (event) => {
    event.stopPropagation();
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !windowEl.hidden) {
      closeChat();
    }
  });

  document.addEventListener('click', (e) => {
    if (windowEl.hidden) return;

    const clickInsideWidget = widgetEl.contains(e.target);
    if (clickInsideWidget) return;

    if (isTabletViewport()) return;

    if (window.innerWidth > 760) {
      closeChat();
    }
  });

  document.addEventListener('touchstart', (e) => {
    if (windowEl.hidden) return;

    const touchInsideWidget = widgetEl.contains(e.target);
    if (touchInsideWidget) return;

    if (isTabletViewport()) return;
  }, { passive: true });

  updateVoiceButton();
})();