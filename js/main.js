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
const BASE_SCALE = 6;
const SELECTED_SCALE = 8;
const CLICK_SCALE = 10;
const CIRCLE_RADIUS = 0.5; // Raio do círculo
const MODEL_NAMES = {
  0: "IQOS ILUMA",
  1: "IQOS ILUMA PRIME",
  2: "IQOS ILUMA ONE"
};

let currentModel = 1;
let isModelClicked = false;
let currentScale = BASE_SCALE;
let currentRotation = 0;
let touchStartX = 0;
let isDragging = false;
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

// Functions
function showModelInfo(index) {
  const modelInfo = document.getElementById('model-info');
  const modelName = document.getElementById('model-name');
  const modelButton = document.querySelector('.model-info button');
  
  // Atualizar informações baseado no modelo
  switch(index) {
    case 0:
      modelName.textContent = 'ILUMA i ONE';
      modelButton.textContent = 'Personalizar ILUMA i ONE';
      modelButton.onclick = () => window.open('ilumaone.html','_self');
      break;
    case 1:
      modelName.textContent = 'ILUMA i';
      modelButton.textContent = 'Personalizar  ILUMA i';
      modelButton.onclick = () => window.open('ilumai.html','_self');
      break;
    case 2:
      modelName.textContent = 'ILUMA i PRIME';
      modelButton.textContent = 'Personalizar ILUMA i PRIME';
      modelButton.onclick = () => window.open('ilumaprime.html','_self');
      break;
  }
  
  modelInfo.style.display = 'block';
}

function hideModelInfo() {
  const modelInfo = document.getElementById('model-info');
  modelInfo.style.display = 'none';
}

function handleModelClick(index) {
  console.log('Clique detectado no modelo:', index);
  const models = document.querySelectorAll('.model-container');
  models.forEach((model, i) => {
    if (i === index) {
      model.setAttribute('visible', 'true');
      model.setAttribute('scale', '12 12 12');
      model.setAttribute('position', '0 0 0');
      model.classList.remove('blurred');
      showModelInfo(i);
    } else {
      model.setAttribute('visible', 'true');
      model.setAttribute('scale', '6 6 6');
      model.classList.add('blurred');
      // Restaurar posição original quando não estiver selecionado
      switch(i) {
        case 0:
          model.setAttribute('position', '-0.1 0 0');
          break;
        case 1:
          model.setAttribute('position', '0 0 0');
          break;
        case 2:
          model.setAttribute('position', '0.1 0 0');
          break;
      }
    }
  });
}

function updateModelPositions() {
  if (!isModelClicked) {
    modelos.forEach((modelo, index) => {
      const angle = (index * (360 / 3) + currentRotation) * (Math.PI / 180);
      const x = CIRCLE_RADIUS * Math.cos(angle);
      const z = CIRCLE_RADIUS * Math.sin(angle);
      
      modelo.setAttribute('position', `${x} 0 ${z}`);
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
  
  if (direction === 'next' && currentModel < 2) {
    currentModel++;
  } else if (direction === 'prev' && currentModel > 0) {
    currentModel--;
  }
  
  updateModelPositions();
}

function updateZoom() {
  modelos.forEach((modelo, index) => {
    const baseScale = index === currentModel ? currentScale * (SELECTED_SCALE/BASE_SCALE) : currentScale;
    modelo.setAttribute('scale', `${baseScale} ${baseScale} ${baseScale}`);
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
prevButton.addEventListener('click', () => changeModel('prev'));
nextButton.addEventListener('click', () => changeModel('next'));

// Target detection events
const target = document.querySelector('a-entity[mindar-image-target]');
target.addEventListener("targetFound", event => {
  modelos.forEach((modelo, i) => {
    modelo.setAttribute('visible', 'true');
    modelo.setAttribute('scale', '6 6 6');
    modelo.classList.remove('blurred');
  });
  
  updateModelPositions();
});

target.addEventListener("targetLost", event => {
  hideModelInfo();
});

// Zoom events
zoomInBtn.addEventListener('click', () => {
  if (currentScale < MAX_SCALE) {
    currentScale *= ZOOM_FACTOR;
    updateZoom();
  }
});

zoomOutBtn.addEventListener('click', () => {
  if (currentScale > MIN_SCALE) {
    currentScale /= ZOOM_FACTOR;
    updateZoom();
  }
});

// Adicionar eventos de toque
sceneEl.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
  isDragging = true;
});

sceneEl.addEventListener('touchmove', (event) => {
  if (!isDragging) return;
  
  const touchX = event.touches[0].clientX;
  const deltaX = touchX - touchStartX;
  
  // Ajustar a rotação baseada no movimento do dedo
  currentRotation += deltaX * 0.5;
  touchStartX = touchX;
  
  updateModelPositions();
});

sceneEl.addEventListener('touchend', () => {
  isDragging = false;
}); 