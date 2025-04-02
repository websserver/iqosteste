// Gerenciador de estado da câmera
const CameraManager = {
    // Chave para o Session Storage
    CAMERA_STATE_KEY: 'camera_permission_state',
    IS_IOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,

    // Inicializa o gerenciador
    init: function() {
        // No iOS, não tentamos solicitar permissão automaticamente
        if (this.IS_IOS) {
            console.log('Dispositivo iOS detectado - aguardando interação do usuário');
            return;
        }

        // Para outros dispositivos, verifica se já temos permissão
        if (!this.hasStoredPermission()) {
            this.requestCameraPermission();
        }
    },

    // Verifica se já temos permissão armazenada
    hasStoredPermission: function() {
        return sessionStorage.getItem(this.CAMERA_STATE_KEY) === 'granted';
    },

    // Solicita permissão da câmera
    requestCameraPermission: async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    facingMode: 'environment'
                }
            });
            
            // Armazena o estado da permissão
            sessionStorage.setItem(this.CAMERA_STATE_KEY, 'granted');
            
            // Para a stream para não consumir recursos
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Erro ao solicitar permissão da câmera:', error);
            sessionStorage.setItem(this.CAMERA_STATE_KEY, 'denied');
        }
    },

    // Limpa o estado armazenado
    clearStoredPermission: function() {
        sessionStorage.removeItem(this.CAMERA_STATE_KEY);
    }
}; 