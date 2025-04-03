// Mapeamento de cores para modelos
const colorToModel = {
    'navy': 'modelo3d/modelo_IQOS ILUMA ONE/navy-blazer.glb',
    'olive': 'modelo3d/modelo_IQOS ILUMA ONE/olive-green.glb',
    'jacaranda': 'modelo3d/modelo_IQOS ILUMA ONE/jacaranda.glb',
    'rooibos': 'modelo3d/modelo_IQOS ILUMA ONE/rooibos-tea.glb',
    'turquoise': 'modelo3d/modelo_IQOS ILUMA ONE/pastel-turquoise.glb'
};

// Função para trocar a cor do modelo
function changeColor(color) {
    // Atualiza a classe active nos botões de cor
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.color === color) {
            option.classList.add('active');
        }
    });

    // Esconde todos os modelos
    const models = document.querySelectorAll('[id^="modelo3d-"]');
    models.forEach(model => {
        model.setAttribute('visible', 'false');
    });

    // Mostra o modelo selecionado
    const selectedModel = document.querySelector(`#modelo3d-${color}`);
    if (selectedModel) {
        selectedModel.setAttribute('visible', 'true');
    }
}

// Adiciona listener para erros de carregamento de modelo
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('model-loaded', (e) => {
            console.log(`Modelo carregado: ${e.detail.model.src}`);
        });
        
        scene.addEventListener('model-error', (e) => {
            console.log(`ERRO ao carregar modelo: ${e.detail.model.src}`);
            console.log(`Detalhes do erro: ${e.detail.error}`);
        });
    }
}); 