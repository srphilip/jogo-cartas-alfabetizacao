// Banco de dados completo de A a Z na ordem correta
const gameData = [
    { palavra: "Abelha", letra: "A", imagem: "images/abelha.png", som: "sounds/a.mp3" },
    { palavra: "Bola", letra: "B", imagem: "images/bola.png", som: "sounds/b.mp3" },
    { palavra: "Casa", letra: "C", imagem: "images/casa.png", som: "sounds/c.mp3" },
    { palavra: "Dado", letra: "D", imagem: "images/dado.png", som: "sounds/d.mp3" },
    { palavra: "Elefante", letra: "E", imagem: "images/elefante.png", som: "sounds/e.mp3" },
    { palavra: "Foca", letra: "F", imagem: "images/foca.png", som: "sounds/f.mp3" },
    { palavra: "Gato", letra: "G", imagem: "images/gato.png", som: "sounds/g.mp3" },
    { palavra: "Hipopótamo", letra: "H", imagem: "images/hipopotamo.png", som: "sounds/h.mp3" },
    { palavra: "Iguana", letra: "I", imagem: "images/iguana.png", som: "sounds/i.mp3" },
    { palavra: "Jacaré", letra: "J", imagem: "images/jacare.png", som: "sounds/j.mp3" },
    { palavra: "Kiwi", letra: "K", imagem: "images/kiwi.png", som: "sounds/k.mp3" },
    { palavra: "Leão", letra: "L", imagem: "images/leao.png", som: "sounds/l.mp3" },
    { palavra: "Macaco", letra: "M", imagem: "images/macaco.png", som: "sounds/m.mp3" },
    { palavra: "Navio", letra: "N", imagem: "images/navio.png", som: "sounds/n.mp3" },
    { palavra: "Ovelha", letra: "O", imagem: "images/ovelha.png", som: "sounds/o.mp3" },
    { palavra: "Pato", letra: "P", imagem: "images/pato.png", som: "sounds/p.mp3" },
    { palavra: "Queijo", letra: "Q", imagem: "images/queijo.png", som: "sounds/q.mp3" },
    { palavra: "Rato", letra: "R", imagem: "images/rato.png", som: "sounds/r.mp3" },
    { palavra: "Sapo", letra: "S", imagem: "images/sapo.png", som: "sounds/s.mp3" },
    { palavra: "Tatu", letra: "T", imagem: "images/tatu.png", som: "sounds/t.mp3" },
    { palavra: "Uva", letra: "U", imagem: "images/uva.png", som: "sounds/u.mp3" },
    { palavra: "Vaca", letra: "V", imagem: "images/vaca.png", som: "sounds/v.mp3" },
    { palavra: "Wafer", letra: "W", imagem: "images/wafer.png", som: "sounds/w.mp3" },
    { palavra: "Xícara", letra: "X", imagem: "images/xicara.png", som: "sounds/x.mp3" },
    { palavra: "Yakult", letra: "Y", imagem: "images/yakult.png", som: "sounds/y.mp3" },
    { palavra: "Zebra", letra: "Z", imagem: "images/zebra.png", som: "sounds/z.mp3" }
];

const alfabetoCompleto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Variáveis de controle de fase e pontuação
let faseAtual = 0;
let scoreGeral = 0;
let acertosNaFase = 0;
let totalItemsFase = 3;
let currentItems = [];

// Variáveis de controle de movimento
let isDragging = false;
let dragElement = null;

const dropZoneContainer = document.getElementById('drop-zone-container');
const lettersContainer = document.getElementById('letters-container');
const scoreDisplay = document.getElementById('score');
const feedbackMessage = document.getElementById('feedback-message');
const restartBtn = document.getElementById('restart-btn');
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');

// Inicializa o jogo do zero
function initGame() {
    faseAtual = 0;
    scoreGeral = 0;
    scoreDisplay.innerText = scoreGeral;
    carregarFase();
}

// Carrega os 3 itens da fase atual
function carregarFase() {
    acertosNaFase = 0;
    isDragging = false;
    dragElement = null;
    
    restartBtn.classList.add('hidden');
    dropZoneContainer.innerHTML = '';
    lettersContainer.innerHTML = '';
    
    feedbackMessage.innerText = "Arraste a letra até o quadro vazio!";
    feedbackMessage.style.color = "#ff9f43";

    // Calcula de onde até onde pegar no array (ex: fase 0 pega index 0, 1 e 2)
    const startIndex = faseAtual * 3;
    currentItems = gameData.slice(startIndex, startIndex + 3);
    totalItemsFase = currentItems.length;

    // Se não tiver mais itens, o jogador zerou o alfabeto!
    if (totalItemsFase === 0) {
        telaFinal();
        return;
    }

    // Renderiza as imagens e os quadros vazios da fase
    currentItems.forEach(item => {
        const itemBox = document.createElement('div');
        itemBox.classList.add('item-box');
        
        itemBox.innerHTML = `
            <img src="${item.imagem}" alt="${item.palavra}" class="item-image" onerror="this.outerHTML='<div class=\\'fallback-text\\'>${item.palavra}</div>'">
            <div class="drop-zone" data-letra="${item.letra}"></div>
        `;
        dropZoneContainer.appendChild(itemBox);
    });

    // Embaralha o alfabeto completo e renderiza as cartas
    let letrasEmbaralhadas = shuffleArray([...alfabetoCompleto]);
    letrasEmbaralhadas.forEach(letra => {
        const letterCard = document.createElement('div');
        letterCard.classList.add('letra-card');
        letterCard.innerText = letra;
        
        letterCard.addEventListener('pointerdown', iniciarArrasto);
        lettersContainer.appendChild(letterCard);
    });
}

// === LÓGICA DE ARRASTAR E SOLTAR ===

function iniciarArrasto(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return; 

    dragElement = e.target;
    isDragging = true;

    dragElement.dataset.startX = e.clientX;
    dragElement.dataset.startY = e.clientY;

    dragElement.classList.add('dragging');

    document.addEventListener('pointermove', arrastar, { passive: false });
    document.addEventListener('pointerup', soltar);
    document.addEventListener('pointercancel', soltar);
}

function arrastar(e) {
    if (!isDragging || !dragElement) return;
    
    e.preventDefault();

    const dx = e.clientX - parseFloat(dragElement.dataset.startX);
    const dy = e.clientY - parseFloat(dragElement.dataset.startY);

    dragElement.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
}

function soltar(e) {
    if (!isDragging || !dragElement) return;

    document.removeEventListener('pointermove', arrastar);
    document.removeEventListener('pointerup', soltar);
    document.removeEventListener('pointercancel', soltar);

    dragElement.style.display = 'none';
    const elementoAbaixoDoDedo = document.elementFromPoint(e.clientX, e.clientY);
    dragElement.style.display = 'flex';

    const zonaAlvo = elementoAbaixoDoDedo ? elementoAbaixoDoDedo.closest('.drop-zone') : null;

    if (zonaAlvo && !zonaAlvo.classList.contains('dropped')) {
        const letraCorreta = zonaAlvo.getAttribute('data-letra');
        const letraArrastada = dragElement.innerText;

        if (letraCorreta === letraArrastada) {
            // ACERTOU
            tocarSom(somAcerto);
            
            const itemObj = currentItems.find(i => i.letra === letraCorreta);
            if(itemObj && itemObj.som) {
                 const somPalavra = new Audio(itemObj.som);
                 setTimeout(() => tocarSom(somPalavra), 600);
            }

            zonaAlvo.innerText = letraArrastada;
            zonaAlvo.classList.add('dropped', 'acerto-animacao');
            zonaAlvo.style.fontSize = "4rem"; 
            zonaAlvo.style.fontWeight = "bold";
            zonaAlvo.style.color = "#2ecc71";
            zonaAlvo.style.backgroundColor = "#e8f8f5";
            zonaAlvo.style.borderColor = "#2ecc71";
            
            dragElement.remove(); 
            
            scoreGeral++;
            acertosNaFase++;
            scoreDisplay.innerText = scoreGeral;
            
            feedbackMessage.innerText = "Muito bem!";
            feedbackMessage.style.color = "#2ecc71";

            verificarFimDeFase();

        } else {
            // ERROU
            tocarSom(somErro);
            zonaAlvo.classList.add('erro-animacao');
            feedbackMessage.innerText = "Ops! Tente novamente!";
            feedbackMessage.style.color = "#e74c3c";
            
            setTimeout(() => zonaAlvo.classList.remove('erro-animacao'), 400);
            resetarPosicao(dragElement); 
        }
    } else {
        // SOLTOU FORA
        resetarPosicao(dragElement);
    }

    if (dragElement) {
        dragElement.classList.remove('dragging');
    }
    
    isDragging = false;
    dragElement = null;
}

function resetarPosicao(elemento) {
    elemento.style.transform = '';
}

function tocarSom(audioElement) {
    if (audioElement && audioElement.readyState >= 2) {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => console.log("Áudio bloqueado."));
    }
}

// === CONTROLE DE FLUXO DO JOGO ===

function verificarFimDeFase() {
    // Se a criança preencheu todos os quadrados desta fase (geralmente 3)
    if (acertosNaFase === totalItemsFase) {
        setTimeout(() => {
            feedbackMessage.innerText = "Parabéns! Vamos para a próxima fase?";
            feedbackMessage.style.color = "#9b59b6";
            
            // Reconfigura o botão para ser o "Próxima Fase"
            restartBtn.innerText = "Próxima Fase";
            restartBtn.onclick = () => {
                faseAtual++; // Avança a fase
                carregarFase(); // Carrega os próximos 3 itens
            };
            restartBtn.classList.remove('hidden');
        }, 500);
    }
}

function telaFinal() {
    feedbackMessage.innerText = "UAU! Você completou todo o Alfabeto!";
    feedbackMessage.style.color = "#f1c40f";
    
    // Volta o botão para o comportamento de reiniciar do zero
    restartBtn.innerText = "Jogar Tudo de Novo";
    restartBtn.onclick = initGame;
    restartBtn.classList.remove('hidden');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.onload = initGame;