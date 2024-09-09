document.addEventListener('DOMContentLoaded', (event) => {
    const qrInput = document.getElementById('qrInput');
    const successAlert = document.getElementById('successAlert');
    const startScan = document.getElementById("startScan");

    // Automatically focus the hidden input field when the page loads
    qrInput.focus();

    qrInput.addEventListener('keydown', function(event) {
        if (event.key === "Enter") {
            // Prevent form submission if applicable
            event.preventDefault();

            // Call the custom function when a QR code is scanned
            myCustomFunction(qrInput.value);
            
            // Clear the input field to allow another scan
            qrInput.value = '';
            
            // Re-focus the input field for the next scan
            qrInput.focus();
            
            // Show success alert
            successAlert.style.display = 'block';

            // Hide the alert after 2 seconds (adjust as needed)
            setTimeout(() => {
                successAlert.style.display = 'none';
            }, 3000);
        }
    });

    startScan.addEventListener("click", () => {
        qrInput.focus();
    })
});

// Custom function to handle QR code processing
function myCustomFunction(value) {
    console.log("QR Code scanned: " + value);
    // Add your logic here to process the QR code value
}