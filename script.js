const fechaReveal = new Date('August 30, 2026 00:00:00').getTime();
// const fechaReveal = new Date().getTime() + (1*60*1000);

function actualizarCuentaRegresiva() {
    const ahora = new Date().getTime();
    const distancia = fechaReveal - ahora;

    if (distancia < 0) {
        document.querySelectorAll('.card-automatica').forEach(card => {
            card.classList.remove('card-bloqueada');
            card.classList.add('card-activa', 'activa-brillo');
            
            const bloqueado = card.querySelector('.estado-bloqueado');
            const desbloqueado = card.querySelector('.estado-desbloqueado');
            
            if (bloqueado && desbloqueado) {
                bloqueado.style.display = 'none';
                desbloqueado.style.display = 'flex';
            }
        });
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

function formatearTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
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
        

        if (!audio || audio.hasAttribute('data-inicializado')) return;
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
        });

        barra.addEventListener('input', (e) => {
            audio.currentTime = (e.target.value / 100) * audio.duration;
            barra.style.setProperty('--progreso', `${e.target.value}%`);
        });
    });
}
inicializarReproductores();


const modal = document.getElementById('modal-letra');
const btnCerrar = document.getElementById('cerrar-modal');
const contenedorLetras = document.getElementById('contenedor-letras');

let letrasData = {};
fetch('letras.json')
    .then(respuesta => respuesta.json())
    .then(datos => { letrasData = datos; })
    .catch(error => console.log("Error al cargar las letras:", error));

document.addEventListener('click', (e) => {

    if (e.target.classList.contains('card-imagen')) {
        
        const trackId = e.target.getAttribute('data-track');
        const cardInfo = e.target.nextElementSibling; 
        const tituloReal = cardInfo.querySelector('.track-title').textContent;
        const imagenRealSrc = e.target.src;
        audioEnModal = cardInfo.querySelector('audio'); 

        imgModal.src = imagenRealSrc;
        tituloModal.textContent = tituloReal;

        tTotalModal.textContent = formatearTiempo(audioEnModal.duration);
        tActualModal.textContent = formatearTiempo(audioEnModal.currentTime);
        const porcentaje = (audioEnModal.currentTime / audioEnModal.duration) * 100 || 0;
        barraModal.value = porcentaje;
        barraModal.style.setProperty('--progreso', `${porcentaje}%`);

        if (audioEnModal.paused) {
            iconoPlayModal.style.display = 'block';
            iconoPauseModal.style.display = 'none';
        } else {
            iconoPlayModal.style.display = 'none';
            iconoPauseModal.style.display = 'block';
        }

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
