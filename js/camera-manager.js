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