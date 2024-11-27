const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');
const { exec } = require('child_process');

async function generateWristbandPDF(sn) {
    try {
        // Define custom page size (25.4mm x 260mm) and convert to points
        const width = 25.4 * 2.83465;  // 25.4mm to points
        const height = 260 * 2.83465;  // 260mm to points

        // Define the folder path to save the PDFs
        const wristbandFolderPath = 'C://Print';
        
        // Ensure the folder exists, create if it doesn't
        if (!fs.existsSync(wristbandFolderPath)) {
            fs.mkdirSync(wristbandFolderPath, { recursive: true });
        }

        // Define file paths
        const filePath1 = path.join(wristbandFolderPath, `${sn}.pdf`);
        const filePath2 = path.join(wristbandFolderPath, 'toPrint.pdf');

        // Create the first PDF (with the serial number in the file name)
        const pdfDoc1 = await PDFDocument.create();
        await addQRCodeToPDF(pdfDoc1, sn, width, height); // Adding image/QR code to the first PDF
        const pdfBytes1 = await pdfDoc1.save();
        fs.writeFileSync(filePath1, pdfBytes1);

        // Create the second PDF (toPrint.pdf)
        const pdfDoc2 = await PDFDocument.create();
        await addQRCodeToPDF(pdfDoc2, sn, width, height); // Adding image/QR code to the second PDF
        const pdfBytes2 = await pdfDoc2.save();
        fs.writeFileSync(filePath2, pdfBytes2);

        console.log(`Wristband PDF generated at: ${filePath1}`);
        console.log(`Printing PDF generated at: ${filePath2}`);

        // Log the print action (optional logging functionality)
        console.log(`Printing wristband: ${sn}`);
        
        // Run the batch file to print the PDF
        runBatchFile();

    } catch (error) {
        console.error('Failed to generate wristband PDF:', error);
    }
}

// Function to generate QR Code
async function generateQRCode(sn) {
    try {
        // Trim spaces or any unexpected characters
        console.log(sn);
        sn = String(sn).trim(); 
        if (typeof sn !== 'string' || sn === '') {
            throw new Error('Invalid SN value');
        }

        console.log('SN value being used:', sn);  // Check value after trim
        const qrData = await QRCode.toDataURL(sn);
        console.log('QR Code Data URL:', qrData);
        return qrData;
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw err;  // Throw error for higher-level handling
    }
}

// Function to add QR code to the PDF document
async function addQRCodeToPDF(pdfDoc, sn, width, height) {
    try {
        // Generate QR Code
        console.log(sn);
        const qrDataUrl = await generateQRCode(sn);
        console.log('QR Buffer Length:', qrDataUrl.length); 

        // Embed the QR code image from the data URL directly into the PDF
        const pngImage = await pdfDoc.embedPng(qrDataUrl);

        // Create a page in the PDF with custom size
        const page = pdfDoc.addPage([width, height]);

        // Position to place QR code at the top and bottom of the page
        const positions = [
            { x: (width - 80) / 2, y: 530 },  // Top position
            { x: (width - 80) / 2, y: 170 }   // Bottom position
        ];

        positions.forEach(({ x, y }) => {
            page.drawImage(pngImage, {
                x,
                y,
                width: 80,
                height: 80,
            });
        });

        console.log('QR Code successfully added to PDF');
    } catch (err) {
        console.error('Error adding QR code to PDF:', err.message);
        throw err; // Re-throw error to be handled in the caller function
    }
}

function runBatchFile() {
    const batchFilePath = path.join('C://Print', 'print.bat');

    exec(`"${batchFilePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running batch file: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Batch file error: ${stderr}`);
            return;
        }
        console.log(`Batch file output: ${stdout}`);
    });
}

module.exports = {
    generateWristbandPDF,
};
