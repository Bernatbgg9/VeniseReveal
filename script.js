// const fechaReveal = new Date().getTime() + (1*60*1000);
const fechaReveal = new Date('August 30, 2026 00:00:00').getTime();
const fechaUnlockTrack9 = new Date(Date.now());

function desbloquearCard(card) {
    card.classList.remove('card-bloqueada');
    card.classList.add('card-activa', 'activa-brillo');

    const bloqueado = card.querySelector('.estado-bloqueado');
    const desbloqueado = card.querySelector('.estado-desbloqueado');

    if (bloqueado && desbloqueado) {
        bloqueado.style.display = 'none';
        desbloqueado.style.display = 'flex';
    }
}

function actualizarCuentaRegresiva() {
    const ahora = new Date().getTime();
    const distancia = fechaReveal - ahora;
    const distanciaTrack9 = fechaUnlockTrack9.getTime() - ahora;

    document.querySelectorAll('.card-automatica').forEach(card => {
        const timer = card.querySelector('.timer');
        const esTrack9 = card.dataset.track === 'track9';

        if (esTrack9) {
            if (distanciaTrack9 < 0) {
                desbloquearCard(card);
                return;
            }

            const horas = Math.floor((distanciaTrack9 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((distanciaTrack9 % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((distanciaTrack9 % (1000 * 60)) / 1000);
            const textoTiempo = `${horas}h ${minutos}m ${segundos}s`;

            if (timer) timer.textContent = textoTiempo;
            return;
        }

        if (distancia < 0) {
            desbloquearCard(card);
            return;
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
        const textoTiempo = `${dias}d ${horas}h ${minutos}m ${segundos}s`;

        if (timer) timer.textContent = textoTiempo;
    });

    if (distancia < 0) {
        inicializarReproductores();
    }
}

setInterval(actualizarCuentaRegresiva, 1000);
actualizarCuentaRegresiva();


function formatearTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}


function obtenerListaCanciones() {
    return Array.from(document.querySelectorAll('.estado-desbloqueado'))
                .filter(div => div.style.display !== 'none')
                .map(div => div.querySelector('audio'))
                .filter(audio => audio !== null);
}

function playSiguiente(audioActual) {
    const lista = obtenerListaCanciones();
    if(lista.length === 0) return;

    let index = lista.indexOf(audioActual);
    
    let nextIndex = (index === lista.length - 1 || index === -1) ? 0 : index + 1;
    const siguienteAudio = lista[nextIndex];

    audioActual.pause();
    audioActual.currentTime = 0; 
    
    siguienteAudio.play();

    if (document.getElementById('modal-letra').style.display === 'flex') {
        actualizarModalConAudio(siguienteAudio);
    }
}

function playAnterior(audioActual) {
    const lista = obtenerListaCanciones();
    if(lista.length === 0) return;

    let index = lista.indexOf(audioActual);
    

    if (audioActual.currentTime > 3) {
        audioActual.currentTime = 0;
        return;
    }

    let prevIndex = (index === 0 || index === -1) ? lista.length - 1 : index - 1;
    const prevAudio = lista[prevIndex];

    audioActual.pause();
    audioActual.currentTime = 0;
    prevAudio.play();

    if (document.getElementById('modal-letra').style.display === 'flex') {
        actualizarModalConAudio(prevAudio);
    }
}

function actualizarMediaSession(audioElement) {
    if ('mediaSession' in navigator) {
        const card = audioElement.closest('.estado-desbloqueado');
        if(!card) return;

        const titulo = card.querySelector('.track-title').textContent;
        const imagenEl = card.querySelector('.card-imagen');
        const imagenSrc = imagenEl ? new URL(imagenEl.src, window.location.href).href : '';

        navigator.mediaSession.metadata = new MediaMetadata({
            title: titulo,
            artist: 'VENISE',
            album: 'Reveal Disco VENISES',
            artwork: imagenSrc ? [
                { src: imagenSrc, sizes: '96x96', type: 'image/jpeg' },
                { src: imagenSrc, sizes: '256x256', type: 'image/jpeg' },
                { src: imagenSrc, sizes: '512x512', type: 'image/jpeg' },
                { src: imagenSrc }
            ] : []
        });

     
        navigator.mediaSession.setActionHandler('play', () => audioElement.play());
        navigator.mediaSession.setActionHandler('pause', () => audioElement.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => playAnterior(audioElement));
        navigator.mediaSession.setActionHandler('nexttrack', () => playSiguiente(audioElement));

        navigator.mediaSession.setActionHandler('seekto', (detalles) => {
            if (detalles.fastSeek && ('fastSeek' in audioElement)) {
                audioElement.fastSeek(detalles.seekTime);
            } else {
                audioElement.currentTime = detalles.seekTime;
            }
        });
    }
}

function actualizarPosicionMediaSession(audioElement) {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
        if (!isNaN(audioElement.duration) && audioElement.duration > 0) {
            navigator.mediaSession.setPositionState({
                duration: audioElement.duration,
                playbackRate: audioElement.playbackRate,
                position: audioElement.currentTime
            });
        }
    }
}


let audioEnModal = null; 

const imgModal = document.querySelector('.modal-imagen-grande');
const tituloModal = document.querySelector('.modal-titulo');
const btnPlayModal = document.getElementById('btn-play-pause-modal');
const iconoPlayModal = document.getElementById('icono-play-modal');
const iconoPauseModal = document.getElementById('icono-pause-modal');
const barraModal = document.getElementById('barra-progreso-modal');
const tActualModal = document.getElementById('tiempo-actual-modal');
const tTotalModal = document.getElementById('tiempo-total-modal');


function inicializarReproductores() {
    document.querySelectorAll('.estado-desbloqueado').forEach(contenedor => {
        const audio = contenedor.querySelector('audio');
        
        if (!audio || audio.hasAttribute('data-inicializado') || audio.id === 'audio-cancion7') return;
        audio.setAttribute('data-inicializado', 'true');

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
            const tieneFuente = (audio.getAttribute('src') || '').trim() !== '';
            if (!tieneFuente) return;

            if (audio.paused) {
                document.querySelectorAll('audio').forEach(a => a.pause());
                audio.play();
            } else {
                audio.pause();
            }
        });

        audio.addEventListener('play', () => {
            iconoPlay.style.display = 'none'; 
            iconoPause.style.display = 'block';
            if(audioEnModal === audio) {
                iconoPlayModal.style.display = 'none'; 
                iconoPauseModal.style.display = 'block';
            }
            actualizarMediaSession(audio);
        });

        audio.addEventListener('pause', () => {
            iconoPlay.style.display = 'block'; 
            iconoPause.style.display = 'none';
            if(audioEnModal === audio) {
                iconoPlayModal.style.display = 'block'; 
                iconoPauseModal.style.display = 'none';
            }
        });

        audio.addEventListener('timeupdate', () => {
            const porcentaje = (audio.currentTime / audio.duration) * 100 || 0;
            const tiempoFormateado = formatearTiempo(audio.currentTime);
            
            barra.value = porcentaje;
            barra.style.setProperty('--progreso', `${porcentaje}%`);
            tActual.textContent = tiempoFormateado;

            if(audioEnModal === audio) {
                barraModal.value = porcentaje;
                barraModal.style.setProperty('--progreso', `${porcentaje}%`);
                tActualModal.textContent = tiempoFormateado;
            }

            actualizarPosicionMediaSession(audio);
        });

        barra.addEventListener('input', (e) => {
            audio.currentTime = (e.target.value / 100) * audio.duration;
            barra.style.setProperty('--progreso', `${e.target.value}%`);
        });

        audio.addEventListener('ended', () => {
            playSiguiente(audio);
        });
    });
}
inicializarReproductores();


const audio7 = document.getElementById('audio-cancion7');
const btnPlay7 = document.getElementById('btn-play-pause-7');
const iconoPlay7 = document.getElementById('icono-play-7');
const iconoPause7 = document.getElementById('icono-pause-7');
const barra7 = document.getElementById('barra-progreso-7');
const tActual7 = document.getElementById('tiempo-actual-7');
const tTotal7 = document.getElementById('tiempo-total-7');

audio7.addEventListener('loadedmetadata', () => {
    tTotal7.textContent = formatearTiempo(audio7.duration);
});

function alternarAudio7() {
    if (audio7.paused) {
        document.querySelectorAll('audio').forEach(a => a.pause());
        audio7.play();
    } else {
        audio7.pause();
    }
}
btnPlay7.addEventListener('click', alternarAudio7);

audio7.addEventListener('play', () => {
    iconoPlay7.style.display = 'none'; iconoPause7.style.display = 'block';
    if(audioEnModal === audio7) {
        iconoPlayModal.style.display = 'none'; iconoPauseModal.style.display = 'block';
    }
    actualizarMediaSession(audio7);
});

audio7.addEventListener('pause', () => {
    iconoPlay7.style.display = 'block'; iconoPause7.style.display = 'none';
    if(audioEnModal === audio7) {
        iconoPlayModal.style.display = 'block'; iconoPauseModal.style.display = 'none';
    }
});

audio7.addEventListener('timeupdate', () => {
    const pct = (audio7.currentTime / audio7.duration) * 100 || 0;
    const tf = formatearTiempo(audio7.currentTime);
    barra7.value = pct; barra7.style.setProperty('--progreso', `${pct}%`); tActual7.textContent = tf;
    
    if(audioEnModal === audio7) {
        barraModal.value = pct; barraModal.style.setProperty('--progreso', `${pct}%`); tActualModal.textContent = tf;
    }

    actualizarPosicionMediaSession(audio7);
});

barra7.addEventListener('input', (e) => {
    audio7.currentTime = (e.target.value / 100) * audio7.duration;
});

audio7.addEventListener('ended', () => {
    playSiguiente(audio7);
});


const modal = document.getElementById('modal-letra');
const btnCerrar = document.getElementById('cerrar-modal');
const contenedorLetras = document.getElementById('contenedor-letras');

let letrasData = {};
fetch('letras.json')
    .then(respuesta => respuesta.json())
    .then(datos => { letrasData = datos; })
    .catch(error => console.log("Error al cargar las letras:", error));

function actualizarModalConAudio(audioElement) {
    const cardInfo = audioElement.closest('.card-info');
    const estadoDesbloqueado = audioElement.closest('.estado-desbloqueado');
    if(!cardInfo || !estadoDesbloqueado) return;

    const imagenObj = estadoDesbloqueado.querySelector('.card-imagen');
    
    audioEnModal = audioElement;
    imgModal.src = imagenObj.src;
    tituloModal.textContent = cardInfo.querySelector('.track-title').textContent;

    tTotalModal.textContent = formatearTiempo(audioEnModal.duration);
    tActualModal.textContent = formatearTiempo(audioEnModal.currentTime);
    const porcentaje = (audioEnModal.currentTime / audioEnModal.duration) * 100 || 0;
    barraModal.value = porcentaje;
    barraModal.style.setProperty('--progreso', `${porcentaje}%`);

    if (audioEnModal.paused) {
        iconoPlayModal.style.display = 'block'; iconoPauseModal.style.display = 'none';
    } else {
        iconoPlayModal.style.display = 'none'; iconoPauseModal.style.display = 'block';
    }

    const trackId = imagenObj.getAttribute('data-track');
    contenedorLetras.innerHTML = ''; 
    if (trackId && letrasData[trackId]) {
        letrasData[trackId].forEach(parrafo => {
            const p = document.createElement('p');
            p.innerHTML = parrafo; 
            contenedorLetras.appendChild(p);
        });
    } else {
        contenedorLetras.innerHTML = '<p>Letra no disponible todavía...</p>';
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('card-imagen')) {
        const audio = e.target.nextElementSibling.querySelector('audio');
        actualizarModalConAudio(audio);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; 
    audioEnModal = null; 
});
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        audioEnModal = null;
    }
});


btnPlayModal.addEventListener('click', () => {
    if(!audioEnModal) return;
    if (audioEnModal.paused) {
        document.querySelectorAll('audio').forEach(a => a.pause());
        audioEnModal.play();
    } else {
        audioEnModal.pause();
    }
});

barraModal.addEventListener('input', (e) => {
    if(!audioEnModal) return;
    audioEnModal.currentTime = (e.target.value / 100) * audioEnModal.duration;
});
