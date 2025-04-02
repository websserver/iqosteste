// Gerenciador de estado da câmera
const CameraManager = {
    // Chave para o Session Storage
    CAMERA_STATE_KEY: 'camera_permission_state',

    // Inicializa o gerenciador
    init: function() {
        // Verifica se já temos permissão
        if (!this.hasStoredPermission()) {
            // Se não tiver, solicita permissão
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
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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