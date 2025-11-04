// ESTADO GLOBAL DE LA APLICACIÓN
const estadoApp = {
    usuario: "María",
    reconocimientoVoz: null,
    sintesisVoz: null,
    luces: {
        principal: true,
        noche: false,
        entrada: true,
        cocina: false,
        brillo: 75
    },
    clima: {
        temperatura: 22,
        humedad: 45,
        modo: "apagado"
    },
    musica: {
        reproduciendo: false,
        volumen: 0.5,
        canciones: [
            {
                titulo: "Música Clásica Relajante",
                artista: "Orquesta Sinfónica", 
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            },
            {
                titulo: "Sonidos de Naturaleza",
                artista: "Bosque Tropical",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
            },
            {
                titulo: "Jazz Suave",
                artista: "Trío de Jazz",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
            }
        ],
        cancionActual: 0
    },
    recordatorios: [
        { id: 1, hora: "8:00 AM", texto: "Desayuno y medicación matutina", completado: true },
        { id: 2, hora: "9:00 AM", texto: "Pastilla azul - presión arterial", completado: false },
        { id: 3, hora: "11:00 AM", texto: "Ejercicios suaves - 15 minutos", completado: false },
        { id: 4, hora: "3:00 PM", texto: "Cita con Dr. González", completado: false }
    ],
    llamadaActiva: false,
    tiempoLlamada: 0
};

// ELEMENTOS DOM
const audioPlayer = document.getElementById('audio-player');
const estadoVoz = document.getElementById('estado-voz');
const conversacionDiv = document.getElementById('conversacion');
const overlayCamara = document.getElementById('overlay-camara');
const overlayVideollamada = document.getElementById('overlay-videollamada');
const tiempoLlamadaElement = document.getElementById('tiempo-llamada');

// INICIALIZACIÓN INTELIGENTE
document.addEventListener('DOMContentLoaded', function() {
    console.log('Acompaña+ - Sistema iniciado');
    inicializarSistemaVoz();
    actualizarHora();
    setInterval(actualizarHora, 60000);
    
    audioPlayer.volume = estadoApp.musica.volumen;
    
    setTimeout(() => {
        seleccionarCancion(estadoApp.musica.cancionActual, false);
        hablar("¡Hola María! Soy Acompaña+. Puedo ayudarte con música, luces, llamadas, recordatorios, seguridad, y conversar contigo sobre cualquier tema. ¿En qué puedo asistirte hoy?");
    }, 1000);
});

// SISTEMA DE VOZ MEJORADO
function inicializarSistemaVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        estadoApp.reconocimientoVoz = new SpeechRecognition();
        estadoApp.reconocimientoVoz.continuous = false;
        estadoApp.reconocimientoVoz.interimResults = false;
        estadoApp.reconocimientoVoz.lang = 'es-ES';

        estadoApp.reconocimientoVoz.onstart = function() {
            estadoVoz.innerHTML = "🎤 Escuchando... habla ahora";
            estadoVoz.style.color = "#4CAF50";
            document.querySelector('.boton-voz').classList.add('grabando');
        };

        estadoApp.reconocimientoVoz.onresult = function(event) {
            const comando = event.results[0][0].transcript.toLowerCase();
            agregarMensajeUsuario(comando);
            procesarComandoInteligente(comando);
        };

        estadoApp.reconocimientoVoz.onerror = function(event) {
            estadoVoz.innerHTML = "❌ Error, intenta de nuevo";
            estadoVoz.style.color = "#f44336";
            document.querySelector('.boton-voz').classList.remove('grabando');
        };

        estadoApp.reconocimientoVoz.onend = function() {
            document.querySelector('.boton-voz').classList.remove('grabando');
            setTimeout(() => {
                estadoVoz.innerHTML = "Presiona para hablar conmigo";
                estadoVoz.style.color = "#666";
            }, 2000);
        };
    }

    estadoApp.sintesisVoz = window.speechSynthesis;
}

function iniciarConversacion() {
    if (estadoApp.reconocimientoVoz) {
        estadoApp.reconocimientoVoz.start();
    }
}

function hablar(texto) {
    if (estadoApp.sintesisVoz) {
        estadoApp.sintesisVoz.cancel();
        
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        agregarMensajeAsistente(texto);
        
        utterance.onstart = function() {
            estadoVoz.innerHTML = "🗣️ Acompaña+ está hablando...";
        };
        
        utterance.onend = function() {
            estadoVoz.innerHTML = "Conversación lista";
        };
        
        estadoApp.sintesisVoz.speak(utterance);
    } else {
        agregarMensajeAsistente(texto);
    }
}

function agregarMensajeUsuario(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje usuario';
    mensajeDiv.textContent = `Tú: ${mensaje}`;
    conversacionDiv.appendChild(mensajeDiv);
    conversacionDiv.scrollTop = conversacionDiv.scrollHeight;
}

function agregarMensajeAsistente(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje asistente';
    mensajeDiv.textContent = `Acompaña+: ${mensaje}`;
    conversacionDiv.appendChild(mensajeDiv);
    conversacionDiv.scrollTop = conversacionDiv.scrollHeight;
}

// SISTEMA DE MÚSICA INTELIGENTE
function toggleReproduccion() {
    if (!estadoApp.musica.reproduciendo) {
        if (!audioPlayer.src) {
            seleccionarCancion(estadoApp.musica.cancionActual, true);
            return;
        }
        
        audioPlayer.play().then(() => {
            estadoApp.musica.reproduciendo = true;
            actualizarInterfazMusica();
        }).catch(error => {
            estadoApp.musica.reproduciendo = false;
            actualizarInterfazMusica();
        });
    } else {
        audioPlayer.pause();
        estadoApp.musica.reproduciendo = false;
        actualizarInterfazMusica();
    }
}

// PROCESADOR INTELIGENTE DE COMANDOS
function procesarComandoInteligente(comando) {
    console.log("Comando recibido:", comando);

    // ========== DETECCIÓN INTELIGENTE POR CATEGORÍAS ==========

    // 🎵 MÚSICA - DETECCIÓN AMPLIA
    if (comando.match(/(música|canción|sonar|reproducir|poner|escuchar)/)) {
        if (comando.match(/(pon|reproducir|inicia|quiero|dale)/)) {
            if (!estadoApp.musica.reproduciendo) {
                toggleReproduccion();
                if (estadoApp.musica.reproduciendo) {
                    hablar("¡Perfecto! La música ya está sonando.");
                } else {
                    hablar("Para música, ve al módulo y haz clic en reproducir primero.");
                }
            } else {
                hablar("La música ya está reproduciéndose.");
            }
            return;
        }
        
        if (comando.match(/(quita|para|detener|apaga|silencia|pausa)/)) {
            if (estadoApp.musica.reproduciendo) {
                audioPlayer.pause();
                estadoApp.musica.reproduciendo = false;
                actualizarInterfazMusica();
                hablar("Música pausada.");
            } else {
                hablar("No hay música sonando.");
            }
            return;
        }
        
        if (comando.match(/(siguiente|otra|próxima)/)) {
            cancionSiguiente();
            hablar(`Cambiando canción. Ahora: ${estadoApp.musica.canciones[estadoApp.musica.cancionActual].titulo}`);
            return;
        }
        
        if (comando.match(/(anterior|atrás|volver)/)) {
            cancionAnterior();
            hablar(`Volviendo a: ${estadoApp.musica.canciones[estadoApp.musica.cancionActual].titulo}`);
            return;
        }
    }

    // 💡 LUCES - DETECCIÓN COMPLETA
    if (comando.match(/(luz|luces|iluminar|prender|encender|apagar)/)) {
        if (comando.match(/(enciende|prende|prender|ilumina)/)) {
            if (comando.match(/(todas|todo)/)) {
                encenderTodasLuces();
                hablar("Todas las luces encendidas.");
            } else if (comando.match(/(principal|sala|comedor)/)) {
                toggleLuz('principal');
                hablar("Luz principal encendida.");
            } else if (comando.match(/(noche|nocturna)/)) {
                toggleLuz('noche');
                hablar("Luz nocturna encendida.");
            } else if (comando.match(/(entrada|puerta)/)) {
                toggleLuz('entrada');
                hablar("Luz de entrada encendida.");
            } else {
                toggleLuz('principal');
                hablar("Luz principal encendida.");
            }
            return;
        }
        
        if (comando.match(/(apaga|apagar)/)) {
            if (comando.match(/(todas|todo)/)) {
                apagarTodasLuces();
                hablar("Todas las luces apagadas.");
            } else {
                toggleLuz('principal');
                hablar("Luz principal apagada.");
            }
            return;
        }
    }

    // 📞 LLAMADAS - DETECCIÓN FLEXIBLE
    if (comando.match(/(llama|llamar|llamada|telefono|marcar)/)) {
        if (comando.match(/(carlos|hijo|mi hijo)/)) {
            realizarLlamada('Carlos', 'voz');
            hablar("Llamando a tu hijo Carlos.");
            return;
        }
        
        if (comando.match(/(ana|nieta|mi nieta)/)) {
            realizarLlamada('Ana', 'video');
            hablar("Llamando a tu nieta Ana por videollamada.");
            return;
        }
        
        if (comando.match(/(doctor|médico|gonzález|gonzalez)/)) {
            realizarLlamada('Dr. González', 'voz');
            hablar("Llamando al doctor González.");
            return;
        }
    }

    // 🆘 EMERGENCIA - DETECCIÓN SENSIBLE
    if (comando.match(/(emergencia|ayuda|socorro|peligro|urgencia)/)) {
        activarEmergencia();
        return;
    }

    // 📅 RECORDATORIOS - DETECCIÓN NATURAL
    if (comando.match(/(recordatorio|tareas|que tengo|que debo|agenda|hoy)/)) {
        const pendientes = estadoApp.recordatorios.filter(r => !r.completado);
        if (pendientes.length > 0) {
            let mensaje = "Para hoy tienes: ";
            pendientes.forEach(r => {
                mensaje += `${r.hora} - ${r.texto}. `;
            });
            hablar(mensaje);
        } else {
            hablar("¡Excelente! No tienes recordatorios pendientes.");
        }
        return;
    }

    if (comando.match(/(tom[ée]|medicina|pastilla|medicamento)/)) {
        completarRecordatorio(2);
        hablar("Perfecto, medicación registrada como completada.");
        return;
    }

    // 🚪 SEGURIDAD - DETECCIÓN CONTEXTUAL
    if (comando.match(/(puerta|entrada|qui[ée]n est[aá]|hay alguien|c[aá]mara|visita)/)) {
        if (comando.match(/(abre|abrir)/)) {
            abrirPuerta();
            hablar("Puerta abierta.");
            return;
        }
        mostrarOverlayCamara();
        hablar("Hay alguien en la entrada. Es tu nieta Ana.");
        return;
    }

    // 💬 CONVERSACIÓN Y EMOCIONES - DETECCIÓN EMPÁTICA
    if (comando.match(/(hola|buenos d[ií]as|buenas tardes|buenas noches)/)) {
        const saludos = [
            "¡Hola María! ¿En qué puedo ayudarte hoy?",
            "¡Buenos días! Me alegra escucharte.",
            "¡Hola! Estoy aquí para lo que necesites."
        ];
        hablar(saludos[Math.floor(Math.random() * saludos.length)]);
        return;
    }

    if (comando.match(/(c[oó]mo est[aá]s|qu[ée] tal|como vas)/)) {
        hablar("Estoy muy bien, gracias por preguntar. ¿Y tú cómo estás?");
        return;
    }

    if (comando.match(/(gracias|agradecido|agradecida)/)) {
        hablar("De nada, María. Es un placer ayudarte.");
        return;
    }

    if (comando.match(/(adi[oó]s|hasta luego|nos vemos|chao)/)) {
        hablar("Hasta luego, María. Cuídate mucho.");
        return;
    }

    // 😊 ESTADO EMOCIONAL - DETECCIÓN SENSIBLE
    if (comando.match(/(triste|sola|soledad|deprim|mal|ansied|preocup)/)) {
        const consuelos = [
            "Lo siento mucho que te sientas así. Estoy aquí contigo. ¿Quieres que ponga música o llamemos a alguien?",
            "No estás sola, María. Yo estoy aquí para acompañarte siempre.",
            "Entiendo cómo te sientes. ¿Qué te gustaría hacer? Estoy aquí para ti.",
            "Tu bienestar es importante. ¿Quieres conversar o hacer algo juntos?"
        ];
        hablar(consuelos[Math.floor(Math.random() * consuelos.length)]);
        return;
    }

    if (comando.match(/(feliz|content|alegre|emocionad|genial|maravill)/)) {
        const celebraciones = [
            "¡Me alegra mucho! Es maravilloso verte feliz.",
            "¡Qué buenas noticias! La felicidad te sienta muy bien.",
            "Me encanta verte así de contenta. ¿Quieres celebrarlo con música?",
            "¡Fantástico! Compartamos este momento tan especial."
        ];
        hablar(celebraciones[Math.floor(Math.random() * celebraciones.length)]);
        return;
    }

    if (comando.match(/(te quiero|te amo|te adoro|te aprecio|me encantas)/)) {
        const respuestasAmor = [
            "¡Qué bonito! Yo también te aprecio mucho, María.",
            "Eso significa mucho para mí. Tu felicidad es mi prioridad.",
            "Eres muy especial para mí. Me encanta poder ayudarte.",
            "Tu cariño me motiva a ser mejor cada día."
        ];
        hablar(respuestasAmor[Math.floor(Math.random() * respuestasAmor.length)]);
        return;
    }

    // 🎭 ENTRETENIMIENTO - DETECCIÓN DIVERTIDA
    if (comando.match(/(chiste|broma|re[íi]r|divertido|gracioso)/)) {
        const chistes = [
            "¿Qué le dice un jamón a otro jamón? ¡Nos vemos en el sandwich!",
            "¿Por qué los pájaros vuelan al sur? ¡Porque caminando es muy lejos!",
            "¿Cómo se despiden los químicos? ¡Ácido un placer!",
            "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
            "¿Por qué las gallinas no usan lentes? ¡Porque ya tienen pico!"
        ];
        hablar(chistes[Math.floor(Math.random() * chistes.length)]);
        return;
    }

    if (comando.match(/(historia|cuento|narra|relato)/)) {
        const historias = [
            "Te cuento de María y su asistente: Cada día era una nueva aventura llena de música, luces mágicas y conversaciones que hacían sonreír el corazón.",
            "Había una vez un hogar donde la tecnología y el cariño se unían para crear momentos especiales. Cada día traía nuevas sorpresas y alegrías compartidas.",
            "En un lugar lleno de amor, una sabia señora y su fiel compañera descubrían juntas las maravillas de cada nuevo día, haciendo la vida más fácil y divertida."
        ];
        hablar(historias[Math.floor(Math.random() * historias.length)]);
        return;
    }

    // ℹ️ INFORMACIÓN - DETECCIÓN ÚTIL
    if (comando.match(/(hora|horario|qu[ée] hora es)/)) {
        const ahora = new Date();
        const hora = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        hablar(`Son las ${hora}.`);
        return;
    }

    if (comando.match(/(tu nombre|qui[ée]n eres|c[oó]mo te llamas|presentate)/)) {
        hablar("Soy Acompaña+, tu asistente personal inteligente. Estoy aquí para ayudarte en todo.");
        return;
    }

    if (comando.match(/(qu[ée] puedes|funciones|para qu[ée] sirves|qu[ée] haces)/)) {
        hablar("Puedo controlar música, luces, hacer llamadas, recordatorios, seguridad, contarte chistes, conversar, y mucho más. ¡Soy tu compañera multifuncional!");
        return;
    }

    // 🔄 VOLUMEN - DETECCIÓN PRÁCTICA
    if (comando.match(/(volumen|sonido|audio)/)) {
        if (comando.match(/(sube|aumenta|m[aá]s|alto)/)) {
            const nuevoVolumen = Math.min(1, estadoApp.musica.volumen + 0.3);
            cambiarVolumen(nuevoVolumen * 100);
            hablar(`Volumen aumentado al ${Math.round(nuevoVolumen * 100)}%`);
            return;
        }
        
        if (comando.match(/(baja|reduce|menos|bajo)/)) {
            const nuevoVolumen = Math.max(0, estadoApp.musica.volumen - 0.3);
            cambiarVolumen(nuevoVolumen * 100);
            hablar(`Volumen reducido al ${Math.round(nuevoVolumen * 100)}%`);
            return;
        }
    }

    // 🌡️ CLIMA - DETECCIÓN AMBIENTAL
    if (comando.match(/(temperatura|clima|calor|fr[ií]o|calefacci[oó]n|ventilador)/)) {
        if (comando.match(/(calefacci[oó]n|calor|caliente)/)) {
            activarModo('calefaccion');
            return;
        }
        
        if (comando.match(/(ventilador|aire|fresco)/)) {
            activarModo('ventilador');
            return;
        }
        
        hablar(`La temperatura actual es de ${estadoApp.clima.temperatura}°C.`);
        return;
    }

    // ========== RESPUESTA INTELIGENTE POR DEFECTO ==========
    const palabras = comando.split(' ');
    const palabrasRelevantes = palabras.filter(palabra => 
        palabra.length > 3 && !['que', 'como', 'donde', 'cuando', 'para', 'porque'].includes(palabra)
    );

    if (palabrasRelevantes.length > 0) {
        const respuestasContextuales = [
            `Interesante lo que dices sobre ${palabrasRelevantes[0]}. ¿Quieres que te ayude con algo específico?`,
            "No estoy segura de entender completamente. ¿Podrías decirlo de otra manera?",
            "¿Te refieres a algo sobre la casa, tu familia, o prefieres conversar?",
            "María, ¿necesitas ayuda con música, luces, llamadas, o es algo diferente?",
            "Cuéntame más sobre lo que necesitas, estoy aquí para escucharte y ayudarte."
        ];
        hablar(respuestasContextuales[Math.floor(Math.random() * respuestasContextuales.length)]);
    } else {
        const respuestasGenerales = [
            "¿En qué puedo ayudarte hoy? Puedo controlar la música, las luces, hacer llamadas, o simplemente conversar.",
            "Estoy aquí para lo que necesites. ¿Qué te gustaría hacer?",
            "¿Necesitas ayuda con algo específico o prefieres que conversemos?",
            "Cuéntame, María, ¿cómo puedo hacer tu día mejor hoy?"
        ];
        hablar(respuestasGenerales[Math.floor(Math.random() * respuestasGenerales.length)]);
    }
}

// FUNCIONES DE MÚSICA
function seleccionarCancion(indice, reproducir = false) {
    if (indice >= 0 && indice < estadoApp.musica.canciones.length) {
        estadoApp.musica.cancionActual = indice;
        const cancion = estadoApp.musica.canciones[indice];
        
        document.querySelectorAll('.cancion-item').forEach(item => item.classList.remove('activa'));
        document.querySelectorAll('.cancion-item')[indice].classList.add('activa');
        
        audioPlayer.src = cancion.url;
        document.getElementById('titulo-actual').textContent = cancion.titulo;
        document.getElementById('artista-actual').textContent = cancion.artista;
        
        if (reproducir) {
            toggleReproduccion();
        } else {
            estadoApp.musica.reproduciendo = false;
            actualizarInterfazMusica();
        }
    }
}

function cancionSiguiente() {
    let nueva = estadoApp.musica.cancionActual + 1;
    if (nueva >= estadoApp.musica.canciones.length) nueva = 0;
    seleccionarCancion(nueva, estadoApp.musica.reproduciendo);
}

function cancionAnterior() {
    let nueva = estadoApp.musica.cancionActual - 1;
    if (nueva < 0) nueva = estadoApp.musica.canciones.length - 1;
    seleccionarCancion(nueva, estadoApp.musica.reproduciendo);
}

function cambiarVolumen(valor) {
    estadoApp.musica.volumen = valor / 100;
    audioPlayer.volume = estadoApp.musica.volumen;
    document.getElementById('valor-volumen').textContent = `${valor}%`;
}

function actualizarInterfazMusica() {
    const btn = document.getElementById('btn-play');
    if (estadoApp.musica.reproduciendo) {
        btn.innerHTML = '⏸️ Pausar';
        btn.classList.add('reproduciendo');
    } else {
        btn.innerHTML = '▶️ Reproducir';
        btn.classList.remove('reproduciendo');
    }
}

// SISTEMA DE LUCES
function controlarBrillo(valor) {
    estadoApp.luces.brillo = valor;
    document.getElementById('valor-brillo').textContent = `${valor}%`;
}

function toggleLuz(tipo) {
    estadoApp.luces[tipo] = !estadoApp.luces[tipo];
    const boton = document.getElementById(`luz-${tipo}`);
    const estado = estadoApp.luces[tipo] ? 'ENCENDIDA' : 'APAGADA';
    boton.textContent = estado;
    boton.className = estadoApp.luces[tipo] ? 'btn-toggle encendido' : 'btn-toggle apagado';
}

function encenderTodasLuces() {
    Object.keys(estadoApp.luces).forEach(key => {
        if (key !== 'brillo') estadoApp.luces[key] = true;
    });
    actualizarBotonesLuces();
}

function apagarTodasLuces() {
    Object.keys(estadoApp.luces).forEach(key => {
        if (key !== 'brillo') estadoApp.luces[key] = false;
    });
    actualizarBotonesLuces();
}

function actualizarBotonesLuces() {
    toggleLuz('principal');
    toggleLuz('noche');
    toggleLuz('entrada');
    toggleLuz('cocina');
}

// SISTEMA DE CLIMA
function controlarTemperatura(valor) {
    estadoApp.clima.temperatura = valor;
    document.getElementById('valor-temperatura').textContent = `${valor}°C`;
    document.getElementById('temp-deseada').textContent = `${valor}°C`;
}

function activarModo(modo) {
    estadoApp.clima.modo = modo;
    const mensajes = {
        'calefaccion': "Calefacción activada",
        'ventilador': "Ventilador encendido", 
        'apagado': "Sistema de clima apagado"
    };
    hablar(mensajes[modo]);
}

// SISTEMA DE LLAMADAS
function realizarLlamada(contacto, tipo) {
    hablar(`Llamando a ${contacto}...`);
    setTimeout(() => {
        if (tipo === 'video') {
            iniciarVideollamada(contacto);
        }
    }, 2000);
}

function iniciarVideollamada(contacto) {
    estadoApp.llamadaActiva = true;
    estadoApp.tiempoLlamada = 0;
    overlayVideollamada.style.display = 'flex';
    
    const intervalo = setInterval(() => {
        if (estadoApp.llamadaActiva) {
            estadoApp.tiempoLlamada++;
            const minutos = Math.floor(estadoApp.tiempoLlamada / 60);
            const segundos = estadoApp.tiempoLlamada % 60;
            tiempoLlamadaElement.textContent = 
                `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        } else {
            clearInterval(intervalo);
        }
    }, 1000);
}

function colgarLlamada() {
    estadoApp.llamadaActiva = false;
    overlayVideollamada.style.display = 'none';
    hablar("Llamada finalizada.");
}

function activarEmergencia() {
    let segundos = 3;
    const btn = document.querySelector('.btn-emergencia');
    const original = btn.innerHTML;
    
    const countdown = setInterval(() => {
        btn.innerHTML = `🆘 ${segundos}...`;
        segundos--;
        
        if (segundos < 0) {
            clearInterval(countdown);
            btn.innerHTML = original;
            hablar("¡Emergencia activada! Alertando a contactos y servicios médicos.");
        }
    }, 1000);
}

// SISTEMA DE CÁMARA
function mostrarOverlayCamara() {
    overlayCamara.style.display = 'flex';
}

function cerrarOverlay() {
    overlayCamara.style.display = 'none';
}

function abrirPuerta() {
    hablar("Puerta abierta.");
    cerrarOverlay();
}

function simularVisita() {
    mostrarOverlayCamara();
    hablar("Hay alguien en la entrada.");
}

// SISTEMA DE RECORDATORIOS
function completarRecordatorio(id) {
    const recordatorio = estadoApp.recordatorios.find(r => r.id === id);
    if (recordatorio) {
        recordatorio.completado = true;
        setTimeout(() => {
            if (document.getElementById('modulo-recordatorios').classList.contains('activa')) {
                abrirModulo('recordatorios');
            }
        }, 500);
    }
}

// NAVEGACIÓN
function abrirModulo(modulo) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(`modulo-${modulo}`).classList.add('activa');
}

function volverPrincipal() {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-principal').classList.add('activa');
}

function actualizarHora() {
    const ahora = new Date();
    const opciones = { hour: '2-digit', minute: '2-digit' };
    const hora = ahora.toLocaleTimeString('es-ES', opciones);
    document.getElementById('hora-actual').textContent = hora;
    
    const horaNum = ahora.getHours();
    let saludo = "¡Buenas noches!";
    if (horaNum >= 5 && horaNum < 12) saludo = "¡Buenos días!";
    else if (horaNum >= 12 && horaNum < 19) saludo = "¡Buenas tardes!";
    
    document.getElementById('saludo-usuario').textContent = `${saludo} ${estadoApp.usuario} ¿En qué te ayudo hoy?`;
}

// EVENTOS
audioPlayer.addEventListener('ended', cancionSiguiente);

// INICIALIZAR
setTimeout(() => seleccionarCancion(0, false), 2000);