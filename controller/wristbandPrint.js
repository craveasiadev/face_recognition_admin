const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');
const { exec } = require('child_process');

async function generateWristbandPDF(sn, ticket, index) {
    try {
        const width = 25.4 * 2.83465; // 25.4mm to points
        const height = 260 * 2.83465; // 260mm to points

        const wristbandFolderPath = 'C://Print';
        if (!fs.existsSync(wristbandFolderPath)) {
            fs.mkdirSync(wristbandFolderPath, { recursive: true });
        }

        // Unique file names
        const filePath1 = path.join(wristbandFolderPath, `${sn}.pdf`);
        const filePath2 = path.join(wristbandFolderPath, `toPrint_${index}.pdf`); // Unique file name

        // Generate and save the unique file
        const pdfDoc1 = await PDFDocument.create();
        await addQRCodeToPDF(pdfDoc1, sn, width, height, ticket);
        const pdfBytes1 = await pdfDoc1.save();
        fs.writeFileSync(filePath1, pdfBytes1);

        const pdfDoc2 = await PDFDocument.create();
        await addQRCodeToPDF(pdfDoc2, sn, width, height, ticket);
        const pdfBytes2 = await pdfDoc2.save();
        fs.writeFileSync(filePath2, pdfBytes2);

        console.log(`Wristband PDF generated at: ${filePath1}`);
        console.log(`Printing PDF generated at: ${filePath2}`);
        console.log(`ticket type is ${ticket}`)

        // Print immediately
        await runBatchFile(filePath2);

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

async function addQRCodeToPDF(pdfDoc, sn, width, height, ticket) {
    try {
        console.log(sn);
        const qrDataUrl = await generateQRCode(sn);
        console.log('QR Buffer Length:', qrDataUrl.length); 

        const pngImage = await pdfDoc.embedPng(qrDataUrl);

        const page = pdfDoc.addPage([width, height]);

        const widthSec = 20.4 * 2.83465; // 25.4mm to points
        const heightSec = 230 * 2.83465; // 260mm to points

        const positions = [
            { x: (width - 74) / 2, y: 480 },  // Top position
            
            { x: (width - 74) / 2, y: 110 }   // Bottom position
        ];

        positions.forEach(({ x, y }) => {
            // Draw the QR code
            page.drawImage(pngImage, {
                x,
                y,
                width: 80,
                height: 80,
            });

            page.drawImage(pngImage, {
                x: x + 11,  // Center the QR code horizontally
                y: 608,               // Position vertically
                width: 60,            // Smaller QR code size
                height: 60,           // Smaller QR code size
            });

            page.drawImage(pngImage, {
                x: x + 11,  // Center the QR code horizontally
                y: 230,               // Position vertically
                width: 60,            // Smaller QR code size
                height: 60,           // Smaller QR code size
            });

           
            if (ticket === "unlimited") {
                page.drawText("Unlimited", {
                    x: x + 18, // Center the text above the QR
                    y: y + 115, // Position above the QR
                    size: 11, // Font size
                });

                
            }

            page.drawText("Entry pass", {
                x: x + 18, // Center the text above the QR
                y: y + 104, // Position above the QR
                size: 10, // Font size
            });

            const currentDate = new Date();
            const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        
                // Draw the current date above the QR code
                page.drawText(formattedDate, {
                    x: x + 16, // Center the text above the QR
                    y: y + 93, // Position above the QR
                    size: 8, // Font size
                });


                page.drawText("FACE ID (NO", {
                    x: x + 18, // Center the text above the QR
                    y: y + 82, // Position above the QR
                    size: 8, // Font size
                });

                page.drawText("SHARING)", {
                    x: x + 18, // Center the text above the QR
                    y: y + 72, // Position above the QR
                    size: 8, // Font size
                });
        });

        console.log('QR Code successfully added to PDF');
    } catch (err) {
        console.error('Error adding QR code to PDF:', err.message);
        throw err; 
    }
}


function runBatchFile(pdfFilePath) {
    return new Promise((resolve, reject) => {
        const batchFilePath = path.join('C://Print', 'print.bat');

        // Pass the dynamically generated PDF file to the batch script
        exec(`"${batchFilePath}" "${pdfFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running batch file: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Batch file error: ${stderr}`);
                reject(stderr);
                return;
            }
            console.log(`Batch file output: ${stdout}`);
            resolve();
        });
    });
}


module.exports = {
    generateWristbandPDF,
};
