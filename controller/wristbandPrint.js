const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');
const { exec } = require('child_process');

async function generateWristbandPDF(sn) {
    try {
       
        const width = 25.4 * 2.83465;  // 25.4mm to points
        const height = 260 * 2.83465;  // 260mm to points

        const wristbandFolderPath = 'C://Print';
        
        if (!fs.existsSync(wristbandFolderPath)) {
            fs.mkdirSync(wristbandFolderPath, { recursive: true });
        }

       
        const filePath1 = path.join(wristbandFolderPath, `${sn}.pdf`);
        const filePath2 = path.join(wristbandFolderPath, 'toPrint.pdf');

        const pdfDoc1 = await PDFDocument.create();
        await addQRCodeToPDF(pdfDoc1, sn, width, height); 
        const pdfBytes1 = await pdfDoc1.save();
        fs.writeFileSync(filePath1, pdfBytes1);

        const pdfDoc2 = await PDFDocument.create();
        await addQRCodeToPDF(pdfDoc2, sn, width, height); 
        const pdfBytes2 = await pdfDoc2.save();
        fs.writeFileSync(filePath2, pdfBytes2);

        console.log(`Wristband PDF generated at: ${filePath1}`);
        console.log(`Printing PDF generated at: ${filePath2}`);

        console.log(`Printing wristband: ${sn}`);

        runBatchFile();

    } catch (error) {
        console.error('Failed to generate wristband PDF:', error);
    }
}

async function generateQRCode(sn) {
    try {

        console.log(sn);
        sn = String(sn).trim(); 
        if (typeof sn !== 'string' || sn === '') {
            throw new Error('Invalid SN value');
        }

        console.log('SN value being used:', sn);  
        const qrData = await QRCode.toDataURL(sn);
        console.log('QR Code Data URL:', qrData);
        return qrData;
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw err; 
    }
}

async function addQRCodeToPDF(pdfDoc, sn, width, height) {
    try {
        console.log(sn);
        const qrDataUrl = await generateQRCode(sn);
        console.log('QR Buffer Length:', qrDataUrl.length); 

        const pngImage = await pdfDoc.embedPng(qrDataUrl);

        const page = pdfDoc.addPage([width, height]);

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
        throw err; 
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
