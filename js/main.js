
AFRAME.registerComponent('model-handler', {
  init: function() {
    const el = this.el;
    const index = parseInt(el.id.split('-')[1]) - 1;
    
    // Adicionar todos os tipos de eventos de interação
    const events = ['click', 'touchstart', 'mousedown'];
    
    events.forEach(eventName => {
      el.addEventListener(eventName, (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        console.log(`Evento ${eventName} detectado no modelo ${index}`);
        console.log('Elemento clicado:', el.id);
        console.log('Posição do clique:', evt.detail.intersection ? evt.detail.intersection.point : 'N/A');
        handleModelClick(index);
      });
    });
  }
});

// Constants and variables
const BASE_SCALE = 8;
const SELECTED_SCALE = 10;
const CLICK_SCALE = 12;
const MODEL_NAMES = {
  0: "IQOS ILUMA",
  1: "IQOS ILUMA PRIME",
  2: "IQOS ILUMA ONE"
};

let currentModel = 1;
let isModelClicked = false;
let currentScale = BASE_SCALE;
const ZOOM_FACTOR = 1.2;
const MIN_SCALE = 5;
const MAX_SCALE = 15;

// DOM Elements
const loading = document.querySelector('.loading');
const modelos = [
  document.querySelector("#modelo3d-1"),
  document.querySelector("#modelo3d-2"),
  document.querySelector("#modelo3d-3")
];
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const personalizeBtn = document.querySelector(".model-info button");
const modelInfo = document.querySelector('#model-info');
const modelName = document.querySelector('#model-name');
const zoomInBtn = document.querySelector('#zoom-in');
const zoomOutBtn = document.querySelector('#zoom-out');

// Variables
let currentIndex = 0;
const models = document.querySelectorAll('.model-container');
const carousel = document.querySelector('.carousel-container');

// Configuração do carrossel
const RADIUS = 0.5; // Raio do círculo
const ANGLE_STEP = 360; // Ângulo entre cada modelo
const TRANSITION_DURATION = 1000; // Duração da transição em ms

// Posições dos modelos no carrossel
const positions = {
    left: { x: -RADIUS, y: 0, z: -RADIUS * 0.5, rotation: -ANGLE_STEP, scale: 4, opacity: 0.7 },
    center: { x: 0, y: 0, z: 0, rotation: 0, scale: 8, opacity: 1 },
    right: { x: RADIUS, y: 0, z: -RADIUS * 0.5, rotation: ANGLE_STEP, scale: 4, opacity: 0.7 }
};

// Configuração dos modelos com suas informações
const modelConfigs = {
    'modelo3d-1': {
        name: 'ILUMA i ONE',
        buttonText: 'Personalizar ILUMA i ONE',
        link: 'ilumaone.html'
    },
    'modelo3d-2': {
        name: 'ILUMA i',
        buttonText: 'Personalizar ILUMA i',
        link: 'ilumai.html'
    },
    'modelo3d-3': {
        name: 'ILUMA i PRIME',
        buttonText: 'Personalizar ILUMA i PRIME',
        link: 'ilumaprime.html'
    }
};

// Função para obter os índices dos modelos visíveis
function getVisibleModels() {
    const prev = (currentIndex - 1 + models.length) % models.length;
    const next = (currentIndex + 1) % models.length;
    return { prev, current: currentIndex, next };
}

// Função para obter a posição do slide
function getSlidePosition(index) {
    const { prev, current, next } = getVisibleModels();
    
    if (index === prev) return 'left';
    if (index === current) return 'center';
    if (index === next) return 'right';
    
    return 'center';
}

// Função para mostrar informações do modelo
function showModelInfo(modelId) {
    const modelConfig = modelConfigs[modelId];
    if (!modelConfig) return;

    const modelInfo = document.querySelector('.model-info');
    if (!modelInfo) return;

    modelInfo.innerHTML = `
        <h2>${modelConfig.name}</h2>
        <button onclick="window.location.href='${modelConfig.link}'">Personalizar</button>
    `;
    modelInfo.style.display = 'flex';
}

// Atualizar posições do carrossel
function updateCarousel(newIndex) {
    const { prev, current, next } = getVisibleModels();
    const rotation = (newIndex - currentIndex) * ANGLE_STEP;
    
    // Atualizar rotação do carrossel
    carousel.setAttribute('rotation', `0 ${rotation} 0`);
    
    // Atualizar posições dos modelos
    models.forEach((model, index) => {
        const position = getSlidePosition(index);
        const targetPos = positions[position];
        
        model.setAttribute('position', `${targetPos.x} ${targetPos.y} ${targetPos.z}`);
        model.setAttribute('rotation', `0 ${targetPos.rotation} 0`);
        model.setAttribute('scale', `${targetPos.scale} ${targetPos.scale} ${targetPos.scale}`);
        model.setAttribute('opacity', targetPos.opacity);

        // Se este é o modelo central, mostrar suas informações e atualizar o modelo 3D
        if (position === 'center') {
            const modelId = model.getAttribute('id');
            showModelInfo(modelId);
            
            // Atualizar o modelo 3D correspondente
            currentModel = index;
            updateModelPositions();
            
            // Salvar o índice do modelo selecionado
            localStorage.setItem('selectedModelIndex', index.toString());
        }
    });
    
    // Atualizar índice atual
    currentIndex = newIndex;
}

// Função para mover para o próximo modelo
function nextModel() {
    const nextIndex = (currentIndex + 1) % models.length;
    updateCarousel(nextIndex);
}

// Função para mover para o modelo anterior
function prevModel() {
    const prevIndex = (currentIndex - 1 + models.length) % models.length;
    updateCarousel(prevIndex);
}

function hideModelInfo() {
  const modelInfo = document.getElementById('model-info');
  modelInfo.style.display = 'none';
}

function updateModelPositions() {
  if (!isModelClicked) {
    modelos.forEach((modelo, index) => {
      if (index === currentModel) {
        modelo.setAttribute('scale', `${SELECTED_SCALE} ${SELECTED_SCALE} ${SELECTED_SCALE}`);
      } else {
        modelo.setAttribute('scale', `${BASE_SCALE} ${BASE_SCALE} ${BASE_SCALE}`);
      }
    });
  }
}

function changeModel(direction) {
  hideModelInfo();
  isModelClicked = false;
  
  // Primeiro, retornamos o modelo atual ao tamanho normal com animação
  modelos[currentModel].setAttribute('animation', {
    property: 'scale',
    to: `${BASE_SCALE} ${BASE_SCALE} ${BASE_SCALE}`,
    dur: 300,
    easing: 'easeOutQuad'
  });

  if (direction === 'next' && currentModel < 2) {
    currentModel++;
  } else if (direction === 'prev' && currentModel > 0) {
    currentModel--;
  }

  // Depois, aumentamos o novo modelo selecionado com animação
  modelos[currentModel].setAttribute('animation', {
    property: 'scale',
    to: `${SELECTED_SCALE} ${SELECTED_SCALE} ${SELECTED_SCALE}`,
    dur: 300,
    easing: 'easeOutQuad'
  });
}

function updateZoom() {
  models.forEach(model => {
    const baseScale = model.getAttribute('position').x === '0' ? 8 : 4;
    model.setAttribute('scale', `${baseScale * currentZoom/6} ${baseScale * currentZoom/6} ${baseScale * currentZoom/6}`);
  });
}

// Event Listeners
window.addEventListener('load', function() {
  // Inicializar com o modelo 2 visível
  modelos.forEach((modelo, i) => {
    if (i === 1) {
      modelo.setAttribute('visible', 'true');
      modelo.setAttribute('scale', '8 8 8');
    } else {
      modelo.setAttribute('visible', 'false');
      modelo.setAttribute('scale', '8 8 8');
    }
  });
});

const sceneEl = document.querySelector('a-scene');
sceneEl.addEventListener('renderstart', () => {
  loading.style.display = 'none';
});

// Button events
prevButton.addEventListener('click', prevModel);
nextButton.addEventListener('click', nextModel);

// Target detection events
const target = document.querySelector('a-entity[mindar-image-target]');

target.addEventListener("targetFound", event => {
    // Mostrar todos os modelos
    modelos.forEach((modelo, i) => {
        modelo.setAttribute('visible', 'true');
        modelo.setAttribute('scale', '6 6 6');
        modelo.classList.remove('blurred');
    });
    
    // Restaurar a posição correta do modelo selecionado
    updateCarousel(currentIndex);
});

target.addEventListener("targetLost", event => {
    // Manter os modelos visíveis
    modelos.forEach((modelo, i) => {
        modelo.setAttribute('visible', 'true');
        modelo.setAttribute('scale', '6 6 6');
        modelo.classList.remove('blurred');
    });
    
    // Selecionar o modelo 2 por padrão
    currentIndex = 1;
    updateCarousel(currentIndex);
});

// Zoom controls
let currentZoom = 6;

zoomInBtn.addEventListener('click', () => {
  currentZoom = Math.min(currentZoom + 1, 10);
  updateZoom();
});

zoomOutBtn.addEventListener('click', () => {
  currentZoom = Math.max(currentZoom - 1, 3);
  updateZoom();
});

// Adicionar eventos de teclado
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        prevModel();
    } else if (event.key === 'ArrowRight') {
        nextModel();
    }
});

// Inicializar posições do carrossel
function initializeCarousel() {
    // Tentar recuperar o índice salvo, se não existir usar o modelo2 (ILUMA i) como padrão
    const savedIndex = localStorage.getItem('selectedModelIndex');
    currentIndex = savedIndex !== null ? parseInt(savedIndex) : 1;
    updateCarousel(currentIndex);
}

// Inicializar o carrossel quando a cena estiver carregada
sceneEl.addEventListener('loaded', () => {
    initializeCarousel();
    updateZoom();
});

// Remover eventos de zoom anteriores
models.forEach(model => {
    model.removeAttribute('event-set__mouseenter');
    model.removeAttribute('event-set__mouseleave');
});

function handleModelClick(index) {
  console.log('Modelo clicado:', index);
  
  // Atualizar o carrossel
  updateCarousel(index);
  
  // Atualizar o modelo atual
  currentModel = index;
  isModelClicked = true;
  
  // Animar o modelo clicado
  modelos[index].setAttribute('animation', {
    property: 'scale',
    to: `${SELECTED_SCALE} ${SELECTED_SCALE} ${SELECTED_SCALE}`,
    dur: 300,
    easing: 'easeOutQuad'
  });
  
  // Retornar os outros modelos ao tamanho normal
  modelos.forEach((modelo, i) => {
    if (i !== index) {
      modelo.setAttribute('animation', {
        property: 'scale',
        to: `${BASE_SCALE} ${BASE_SCALE} ${BASE_SCALE}`,
        dur: 300,
        easing: 'easeOutQuad'
      });
    }
  });
  
  // Mostrar informações do modelo
  const modelId = `modelo3d-${index + 1}`;
  showModelInfo(modelId);
} 