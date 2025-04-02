// Gerenciador de estado da câmera
const CameraManager = {
    // Chave para o Local Storage
    CAMERA_STATE_KEY: 'camera_permission_state',
    PERMISSION_CHECK_DELAY: 1000, // 1 segundo de delay

    // Inicializa o gerenciador
    init: function() {
        // Adiciona um pequeno delay para garantir que o estado seja verificado corretamente
        setTimeout(() => {
            this.checkAndRequestPermission();
        }, this.PERMISSION_CHECK_DELAY);

        // Adiciona listener para o evento pageshow (dispara quando a página é mostrada, incluindo ao voltar)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // Se a página foi restaurada do cache (back-forward cache)
                console.log('Página restaurada do cache, reativando câmera...');
                this.reactivateCamera();
            }
        });
    },

    // Reativa a câmera após voltar para a página
    reactivateCamera: async function() {
        try {
            // Limpa o estado armazenado para forçar uma nova verificação
            this.clearStoredPermission();
            
            // Força a reativação da câmera
            await this.requestCameraPermission();
            
            // Notifica o A-Frame para reativar a câmera
            if (window.AFRAME) {
                const scene = document.querySelector('a-scene');
                if (scene) {
                    scene.setAttribute('arjs', 'sourceType: webcam; sourceWidth: 1280; sourceHeight: 720; displayWidth: window.innerWidth; displayHeight: window.innerHeight;');
                }
            }
        } catch (error) {
            console.error('Erro ao reativar câmera:', error);
        }
    },

    // Verifica e solicita permissão se necessário
    checkAndRequestPermission: async function() {
        try {
            // Primeiro verifica o estado atual da permissão
            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            
            if (permissionStatus.state === 'granted') {
                // Se já tiver permissão, apenas armazena
                localStorage.setItem(this.CAMERA_STATE_KEY, 'granted');
                return;
            }

            // Se não tiver permissão armazenada, solicita
            if (!this.hasStoredPermission()) {
                await this.requestCameraPermission();
            }
        } catch (error) {
            console.error('Erro ao verificar permissão:', error);
            // Em caso de erro, tenta solicitar permissão
            if (!this.hasStoredPermission()) {
                await this.requestCameraPermission();
            }
        }
    },

    // Verifica se já temos permissão armazenada
    hasStoredPermission: function() {
        return localStorage.getItem(this.CAMERA_STATE_KEY) === 'granted';
    },

    // Solicita permissão da câmera
    requestCameraPermission: async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            // Armazena o estado da permissão
            localStorage.setItem(this.CAMERA_STATE_KEY, 'granted');
            
            // Para a stream para não consumir recursos
            stream.getTracks().forEach(track => track.stop());
            
            // Atualiza o estado da permissão
            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            if (permissionStatus.state === 'granted') {
                localStorage.setItem(this.CAMERA_STATE_KEY, 'granted');
            }
        } catch (error) {
            console.error('Erro ao solicitar permissão da câmera:', error);
            localStorage.setItem(this.CAMERA_STATE_KEY, 'denied');
        }
    },

    // Limpa o estado armazenado
    clearStoredPermission: function() {
        localStorage.removeItem(this.CAMERA_STATE_KEY);
    }
};

// Gerenciador de câmera AR para lidar com problemas de cache no iOS
document.addEventListener('DOMContentLoaded', function() {
    const sceneEl = document.querySelector('a-scene[mindar-image]');
    if (!sceneEl) {
        console.warn('Cena AR não encontrada');
        return;
    }

    // Função para reiniciar o AR de forma segura
    function restartAR() {
        console.log('Tentando reiniciar AR...');
        
        // Verifica se o componente mindar-image existe
        if (!sceneEl.components['mindar-image']) {
            console.warn('Componente mindar-image não encontrado');
            return;
        }

        try {
            // Para o AR
            console.log('Parando AR...');
            sceneEl.components['mindar-image'].stop();
            
            // Espera um tempo maior para garantir que tudo foi limpo
            setTimeout(() => {
                console.log('Reiniciando AR...');
                sceneEl.components['mindar-image'].start();
                
                // Força atualização da cena
                if (sceneEl.object3D) {
                    sceneEl.object3D.updateMatrix();
                    sceneEl.object3D.updateMatrixWorld(true);
                }
                
                // Verifica se há modelos 3D e força sua atualização
                const models = document.querySelectorAll('a-entity[gltf-model]');
                models.forEach(model => {
                    if (model.object3D) {
                        model.object3D.visible = true;
                        model.object3D.updateMatrix();
                        model.object3D.updateMatrixWorld(true);
                    }
                });
            }, 500); // Aumentado para 500ms
        } catch (error) {
            console.error('Erro ao reiniciar AR:', error);
        }
    }

    // Evento pageshow para lidar com restauração do cache
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            console.log('Página restaurada do cache, reiniciando AR...');
            // Pequeno delay para garantir que a página está pronta
            setTimeout(restartAR, 100);
        }
    });

    // Evento visibilitychange para lidar com mudanças de visibilidade
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('Página tornou-se visível, verificando estado do AR...');
            // Pequeno delay para garantir que a página está pronta
            setTimeout(restartAR, 100);
        }
    });

    // Evento focus para lidar com retorno ao app
    window.addEventListener('focus', function() {
        console.log('Janela recebeu foco, verificando estado do AR...');
        // Pequeno delay para garantir que a página está pronta
        setTimeout(restartAR, 100);
    });
}); 