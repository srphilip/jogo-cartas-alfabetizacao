const gameData = [
    { palavra: "Abelha", letra: "A", imagem: "images/abelha.png", som: "sounds/abelha.mp3" },
    { palavra: "Bola", letra: "B", imagem: "images/bola.png", som: "sounds/bola.mp3" },
    { palavra: "Gato", letra: "G", imagem: "images/gato.png", som: "sounds/gato.mp3" },
    { palavra: "Sapo", letra: "S", imagem: "images/sapo.png", som: "sounds/sapo.mp3" }
];

let score = 0;
let totalItems = 3;
let currentItems = [];

// Variáveis para controlar o movimento do dedo/mouse
let isDragging = false;
let dragElement = null;

const dropZoneContainer = document.getElementById('drop-zone-container');
const lettersContainer = document.getElementById('letters-container');
const scoreDisplay = document.getElementById('score');
const feedbackMessage = document.getElementById('feedback-message');
const restartBtn = document.getElementById('restart-btn');
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');

function initGame() {
    score = 0;
    scoreDisplay.innerText = score;
    feedbackMessage.innerText = "Arraste a letra até o quadro vazio!";
    feedbackMessage.style.color = "#ff9f43";
    restartBtn.classList.add('hidden');
    dropZoneContainer.innerHTML = '';
    lettersContainer.innerHTML = '';

    currentItems = shuffleArray([...gameData]).slice(0, totalItems);
    let letras = currentItems.map(item => item.letra);
    letras = shuffleArray(letras);

    currentItems.forEach(item => {
        const itemBox = document.createElement('div');
        itemBox.classList.add('item-box');
        
        itemBox.innerHTML = `
            <img src="${item.imagem}" alt="${item.palavra}" class="item-image" onerror="this.outerHTML='<div class=\\'fallback-text\\'>${item.palavra}</div>'">
            <div class="drop-zone" data-letra="${item.letra}"></div>
        `;
        dropZoneContainer.appendChild(itemBox);
    });

    letras.forEach(letra => {
        const letterCard = document.createElement('div');
        letterCard.classList.add('letra-card');
        letterCard.innerText = letra;
        
        // EVENTO PRINCIPAL: Quando a criança encosta o dedo na carta
        letterCard.addEventListener('pointerdown', iniciarArrasto);
        
        lettersContainer.appendChild(letterCard);
    });
}

// === LÓGICA DE ARRASTO PARA TELAS DE TOQUE (TABLETS) === //

function iniciarArrasto(e) {
    // Só permite arrastar com o botão esquerdo do mouse ou com o dedo
    if (e.button !== 0 && e.pointerType === 'mouse') return; 

    dragElement = e.target;
    isDragging = true;

    // Guarda a posição inicial do dedo na tela
    dragElement.dataset.startX = e.clientX;
    dragElement.dataset.startY = e.clientY;

    dragElement.classList.add('dragging');

    // Avisa o navegador para ouvir os movimentos do dedo pela tela inteira
    document.addEventListener('pointermove', arrastar, { passive: false });
    document.addEventListener('pointerup', soltar);
    document.addEventListener('pointercancel', soltar);
}

function arrastar(e) {
    if (!isDragging || !dragElement) return;
    
    e.preventDefault(); // Impede o tablet de tentar rolar a página para baixo

    // Calcula o quanto o dedo se moveu desde o clique inicial
    const dx = e.clientX - parseFloat(dragElement.dataset.startX);
    const dy = e.clientY - parseFloat(dragElement.dataset.startY);

    // Move a carta visualmente acompanhando o dedo
    dragElement.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
}

function soltar(e) {
    if (!isDragging || !dragElement) return;

    // Remove os ouvintes de movimento
    document.removeEventListener('pointermove', arrastar);
    document.removeEventListener('pointerup', soltar);
    document.removeEventListener('pointercancel', soltar);

    // TRUQUE MÁGICO: Esconde a carta por 1 milissegundo para o navegador conseguir ler qual elemento está *debaixo* do dedo da criança
    dragElement.style.display = 'none';
    const elementoAbaixoDoDedo = document.elementFromPoint(e.clientX, e.clientY);
    dragElement.style.display = 'flex'; // Traz a carta de volta

    // Verifica se o que estava embaixo do dedo era uma zona de soltar válida
    const zonaAlvo = elementoAbaixoDoDedo ? elementoAbaixoDoDedo.closest('.drop-zone') : null;

    if (zonaAlvo && !zonaAlvo.classList.contains('dropped')) {
        const letraCorreta = zonaAlvo.getAttribute('data-letra');
        const letraArrastada = dragElement.innerText;

        if (letraCorreta === letraArrastada) {
            // ACERTOU!
            tocarSom(somAcerto);
            
            const itemObj = currentItems.find(i => i.letra === letraCorreta);
            if(itemObj && itemObj.som) {
                 const somPalavra = new Audio(itemObj.som);
                 setTimeout(() => tocarSom(somPalavra), 600);
            }

            zonaAlvo.innerText = letraArrastada;
            zonaAlvo.classList.add('dropped', 'acerto-animacao');
            zonaAlvo.style.fontSize = "3rem";
            zonaAlvo.style.fontWeight = "bold";
            zonaAlvo.style.color = "#2ecc71";
            zonaAlvo.style.backgroundColor = "#e8f8f5";
            zonaAlvo.style.borderColor = "#2ecc71";
            
            dragElement.remove(); // Destrói a carta arrastada
            
            score++;
            scoreDisplay.innerText = score;
            feedbackMessage.innerText = "Muito bem! Você acertou!";
            feedbackMessage.style.color = "#2ecc71";

            verificarFimDeJogo();

        } else {
            // ERROU DE QUADRADO
            tocarSom(somErro);
            zonaAlvo.classList.add('erro-animacao');
            feedbackMessage.innerText = "Ops! Tente novamente!";
            feedbackMessage.style.color = "#e74c3c";
            
            setTimeout(() => zonaAlvo.classList.remove('erro-animacao'), 400);
            resetarPosicao(dragElement); // Devolve a carta para a base
        }
    } else {
        // SOLTOU NO LUGAR ERRADO (Fora dos quadrados)
        resetarPosicao(dragElement);
    }

    if (dragElement) {
        dragElement.classList.remove('dragging');
    }
    
    isDragging = false;
    dragElement = null;
}

function resetarPosicao(elemento) {
    // Tira os estilos de movimento e a carta volta para o lugar original suavemente
    elemento.style.transform = '';
}

function tocarSom(audioElement) {
    if (audioElement && audioElement.readyState >= 2) {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => console.log("Áudio bloqueado pelo navegador."));
    }
}

function verificarFimDeJogo() {
    if (score === totalItems) {
        setTimeout(() => {
            feedbackMessage.innerText = "Parabéns! Você completou tudo!";
            restartBtn.classList.remove('hidden');
        }, 500);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

restartBtn.addEventListener('click', initGame);
window.onload = initGame;