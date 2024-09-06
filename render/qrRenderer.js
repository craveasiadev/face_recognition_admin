document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qrVal');
    const startListeningButton = document.getElementById('startListening');
    const refreshButton = document.getElementById('refresh');

    qrInput.disabled = true;

    startListeningButton.addEventListener("click", () => {
        qrInput.disabled = false
        qrInput.focus();
    })

    document.getElementById("qrTest").addEventListener("submit", () => {
        alert(`Scanned output: ${qrInput.value}`);
    })

    
});
