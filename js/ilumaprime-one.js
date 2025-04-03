// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const loading = document.querySelector('.loading');
  const target = document.querySelector('a-entity[mindar-image-target]');

  // Função para esconder loading
  function hideLoading() {
    if (loading) {
      loading.style.display = 'none';
    }
  }

  // Eventos de detecção do marcador
  if (target) {
    target.addEventListener("targetFound", () => {
      // Mostra o modelo navy por padrão
      const navyModel = document.querySelector("#modelo3d-navy");
      if (navyModel) {
        navyModel.setAttribute('visible', 'true');
        hideLoading();
      }
    });

    target.addEventListener("targetLost", () => {
      // Esconde todos os modelos
      const models = document.querySelectorAll('[id^="modelo3d-"]');
      models.forEach(model => {
        model.setAttribute('visible', 'false');
      });
    });
  }

  // Esconder loading após 5 segundos (fallback)
  setTimeout(hideLoading, 5000);
});

