// ==========================================
// 1. CUENTA REGRESIVA Y AUTO-DESBLOQUEO
// ==========================================
// const fechaReveal = new Date('August 30, 2026 00:00:00').getTime(); // (Guardamos la original comentada)

// TRUCO DE PRUEBA: Suma 2 minutos (120,000 milisegundos) al momento en que abres la web
// const fechaReveal = new Date('August 30, 2026 00:00:00').getTime();
const fechaReveal = new Date().getTime() + 1*60*1000;

function actualizarCuentaRegresiva() {
    const ahora = new Date().getTime();
    const distancia = fechaReveal - ahora;

    if (distancia < 0) {
        // EL TIEMPO HA TERMINADO: Revelamos el disco
        document.querySelectorAll('.card-automatica').forEach(card => {
            card.classList.remove('card-bloqueada');
            card.classList.add('card-activa', 'activa-brillo');
            
            // Si existen, ocultamos el bloqueado y mostramos el reproductor real
            const bloqueado = card.querySelector('.estado-bloqueado');
            const desbloqueado = card.querySelector('.estado-desbloqueado');
            
            if (bloqueado && desbloqueado) {
                bloqueado.style.display = 'none';
                desbloqueado.style.display = 'flex';
            }
        });
        
        // Inicializamos los nuevos reproductores que acaban de aparecer
        inicializarReproductores(); 
        return; 
    }

    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
    const textoTiempo = `${dias}d ${horas}h ${minutos}m ${segundos}s`;

    document.querySelectorAll('.timer').forEach(timer => {
        timer.textContent = textoTiempo;
    });
}

setInterval(actualizarCuentaRegresiva, 1000);
actualizarCuentaRegresiva();

// ==========================================
// 2. UTILIDADES DE TIEMPO
// ==========================================
function formatearTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// ==========================================
// 3. REPRODUCTORES GENERALES (Para las canciones del 1 al 6 y 8 al 11)
// ==========================================
function inicializarReproductores() {
    // Buscamos todas las tarjetas que tengan un audio (menos la 7, que va por libre)
    document.querySelectorAll('.estado-desbloqueado').forEach(contenedor => {
        const audio = contenedor.querySelector('audio');
        
        // Si no hay audio o es el audio 7 (que tiene ID), lo ignoramos aquí
        if (!audio || audio.id === 'audio-cancion7') return;

        const btn = contenedor.querySelector('.btn-play-pause');
        const iconoPlay = contenedor.querySelector('.icono-play');
        const iconoPause = contenedor.querySelector('.icono-pause');
        const barra = contenedor.querySelector('.barra-progreso');
        const tActual = contenedor.querySelector('.tiempo-actual');
        const tTotal = contenedor.querySelector('.tiempo-total');

        audio.addEventListener('loadedmetadata', () => {
            tTotal.textContent = formatearTiempo(audio.duration);
        });

        btn.addEventListener('click', () => {
            if (audio.paused) {
                // Pausamos cualquier otra canción que suene
                document.querySelectorAll('audio').forEach(a => a.pause());
                audio.play();
            } else {
                audio.pause();
            }
        });

        audio.addEventListener('play', () => {
            iconoPlay.style.display = 'none';
            iconoPause.style.display = 'block';
        });

        audio.addEventListener('pause', () => {
            iconoPlay.style.display = 'block';
            iconoPause.style.display = 'none';
        });

        audio.addEventListener('timeupdate', () => {
            const porcentaje = (audio.currentTime / audio.duration) * 100;
            barra.value = porcentaje || 0;
            barra.style.setProperty('--progreso', `${porcentaje || 0}%`);
            tActual.textContent = formatearTiempo(audio.currentTime);
        });

        barra.addEventListener('input', (e) => {
            const tiempoCalculado = (e.target.value / 100) * audio.duration;
            audio.currentTime = tiempoCalculado;
            barra.style.setProperty('--progreso', `${e.target.value}%`);
        });
    });
}
// Las inicializamos por si acaso ya hubiera alguna visible
inicializarReproductores();


// ==========================================
// 4. SINCRONIZACIÓN ESPECIAL: CANCIÓN 7 Y MODAL
// ==========================================
const audio7 = document.getElementById('audio-cancion7');

// Tarjeta 7
const btnPlay7 = document.getElementById('btn-play-pause-7');
const iconoPlay7 = document.getElementById('icono-play-7');
const iconoPause7 = document.getElementById('icono-pause-7');
const barra7 = document.getElementById('barra-progreso-7');
const tActual7 = document.getElementById('tiempo-actual-7');
const tTotal7 = document.getElementById('tiempo-total-7');

// Modal
const btnPlayModal = document.getElementById('btn-play-pause-modal');
const iconoPlayModal = document.getElementById('icono-play-modal');
const iconoPauseModal = document.getElementById('icono-pause-modal');
const barraModal = document.getElementById('barra-progreso-modal');
const tActualModal = document.getElementById('tiempo-actual-modal');
const tTotalModal = document.getElementById('tiempo-total-modal');

// Duración
audio7.addEventListener('loadedmetadata', () => {
    const dur = formatearTiempo(audio7.duration);
    tTotal7.textContent = dur;
    tTotalModal.textContent = dur;
});

// Reproducir/Pausar (desde cualquiera de los dos botones)
function alternarAudio7() {
    if (audio7.paused) {
        document.querySelectorAll('audio').forEach(a => a.pause()); // Pausa al resto
        audio7.play();
    } else {
        audio7.pause();
    }
}
btnPlay7.addEventListener('click', alternarAudio7);
btnPlayModal.addEventListener('click', alternarAudio7);

// Actualizar Iconos
function actIconos7() {
    if (audio7.paused) {
        iconoPlay7.style.display = 'block'; iconoPause7.style.display = 'none';
        iconoPlayModal.style.display = 'block'; iconoPauseModal.style.display = 'none';
    } else {
        iconoPlay7.style.display = 'none'; iconoPause7.style.display = 'block';
        iconoPlayModal.style.display = 'none'; iconoPauseModal.style.display = 'block';
    }
}
audio7.addEventListener('play', actIconos7);
audio7.addEventListener('pause', actIconos7);

// Sincronizar Barras
audio7.addEventListener('timeupdate', () => {
    const pct = (audio7.currentTime / audio7.duration) * 100 || 0;
    const tf = formatearTiempo(audio7.currentTime);
    
    barra7.value = pct; barra7.style.setProperty('--progreso', `${pct}%`); tActual7.textContent = tf;
    barraModal.value = pct; barraModal.style.setProperty('--progreso', `${pct}%`); tActualModal.textContent = tf;
});

// Arrastrar Barras (Desde cualquiera de las dos)
function arrastrarAudio7(e) {
    audio7.currentTime = (e.target.value / 100) * audio7.duration;
}
barra7.addEventListener('input', arrastrarAudio7);
barraModal.addEventListener('input', arrastrarAudio7);


// ==========================================
// 5. APERTURA, CIERRE DEL MODAL Y LECTURA DE JSON
// ==========================================
const modal = document.getElementById('modal-letra');
const btnCerrar = document.getElementById('cerrar-modal');
const contenedorLetras = document.getElementById('contenedor-letras');

// 5.1 Cargar el JSON de las letras al iniciar la página
let letrasData = {};
fetch('letras.json')
    .then(respuesta => respuesta.json())
    .then(datos => {
        letrasData = datos;
    })
    .catch(error => console.log("Error al cargar las letras:", error));


// 5.2 Escuchamos clics en las imágenes de las tarjetas
document.addEventListener('click', (e) => {
    // Verificamos si lo que hemos pinchado es una carátula
    if (e.target.classList.contains('card-imagen')) {
        
        // Saber qué canción hemos pinchado (ej: "track7")
        const trackId = e.target.getAttribute('data-track');
        
        // Limpiamos las letras anteriores
        contenedorLetras.innerHTML = '';

        // Si tenemos letras para esta canción en el JSON, las mostramos
        if (trackId && letrasData[trackId]) {
            letrasData[trackId].forEach(parrafo => {
                const p = document.createElement('p');
                p.innerHTML = parrafo; // .innerHTML permite que funcione el <br>
                contenedorLetras.appendChild(p);
            });
        } else {
            // Si no hay letra para este track en el JSON
            contenedorLetras.innerHTML = '<p>Letra no disponible todavía...</p>';
        }

        // Abrimos el modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});

// 5.3 Cerrar el modal
btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; 
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});