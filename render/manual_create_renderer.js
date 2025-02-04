// renderer.js
document.addEventListener('DOMContentLoaded', async () => {
  

    function generateUserSN() {
        
        let userSN = Date.now();
        
        return userSN;
    }    

    let uniqueCounter = 0;

    function generateCardNumber() {
        const timestamp = Date.now(); 
        uniqueCounter += 1; // Increment a counter for every call
        return `${timestamp}${uniqueCounter}`;
    }

    document.getElementById("manualCreateForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const totalUserCreate = document.getElementById("totalUserCreate").value;
        const orderDetailID = document.getElementById("orderDetailID").value;
        const areaName = document.getElementById("deviceArea").value;
        const ticketTypeF = document.getElementById("ticketType").value
        
        if (orderDetailID === "") {
            showValidateAlert("Order Detail ID cannot be empty", "danger");
            return
        }

        if (totalUserCreate === "") {
            showValidateAlert("Total user create cannot be empty", "danger");
            return
        }

        if (areaName === "") {
            showValidateAlert("Area cannot be empty", "danger");
            return
        }

        if (ticketTypeF === "") {
            showValidateAlert("Type cannot be empty", "danger");
            return
        }

        const baseName = "User " + orderDetailID;

        console.log(ticketTypeF)

        try {
            for (let i = 0; i < totalUserCreate; i++) {
                const name = `${baseName}`; 
                const email = "N/A";
                const phone = "N/A";
                const sn = generateUserSN();
                const card = generateCardNumber();
                const role = 2;
                const area = areaName;
                const username = `${baseName}`;
                const image = "no image";

                console.log(`Processing card: ${card}`);
    
                await (async (currentSn, currentCard) => {
                    await submitForm(name, username, email, phone, role, image, currentSn, currentCard, area, ticketTypeF);
                    await window.api.generateWristbandPDF(currentCard);
                })(sn, card);
            }
            showValidateAlert("Users created successfully!", "success");
        } catch (error) {
            console.error("Unexpected error:", error);
            showValidateAlert("An unexpected error occurred", "danger");
        }

        
    
        })
});

document.addEventListener('DOMContentLoaded', async () => {
    const deviceAreaList = document.getElementById('deviceArea');
    
    try {
        const areas = await window.api.getDeviceArea();
        
        deviceAreaList.innerHTML = `
            <option value="" selected="selected">Select Area</option>
            ${areas.map(area => `
                <option value="${area.id}">${area.area_name}</option>
            `).join('')}
        `;
    } catch (err) {
        console.error('Failed to load device areas:', err);
    }
    
});

function showValidateAlert(message, type) {
    const alertContainer = document.getElementById('validate-alert-container');
    
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.style.display = 'block';
    
    
    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 3000);
}


async function submitForm(name, username, email, phone, role, image, sn, card, area, ticketTypeF) {
    try {
        await window.api.insertUser(name, username, email, phone, role, image, sn, card);
        console.log("User created successfully.");

        const devices = await window.api.getDeviceByArea(area);
        console.log("sn:", sn); 
        console.log("cardnumber:", card); 
        console.log("type:", ticketTypeF); 
        let payload;
        if (ticketTypeF == "unlimited") {
            payload = {
                type: 2,
                sn: sn,
                name: name,
                cardNo: card,
                mobile: phone,
                acGroupNumber: 0,
                verifyStyle: 0,
                expiredType: 0,
                validCount: 1,
                validTimeBegin: Date.now(),
                validTimeEnd: Date.now() + (1000 * 60 * 60 * 24 * 365) // 1-year expiration
            };
        } else {
            payload = {
                type: 2,
                sn: sn,
                name: name,
                cardNo: card,
                mobile: phone,
                acGroupNumber: 0,
                verifyStyle: 0,
                expiredType: 2,
                validCount: 1,
                validTimeBegin: Date.now(),
                validTimeEnd: Date.now() + (1000 * 60 * 60 * 24 * 365) // 1-year expiration
            };
        }
        

        console.log(payload)

        for (const device of devices) {
            try {
                const deviceUrl = `http://${device.device_ip}:8090/cgi-bin/js/person/create`;
                const response = await fetch(deviceUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('admin:' + device.communication_password),
                    },
                    body: JSON.stringify(payload),
                });
        
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Error adding user to device ${device.device_ip}:`, errorText);
                    throw new Error(`Error with device ${device.device_ip}`);
                } else {
                    const responseText = await response.text();
                    console.log(`Device response for user ${sn}:`, responseText);
                    console.log(`User added to device ${device.device_ip} successfully`);
                }
            } catch (error) {
                console.error(`Failed to add user to device ${device.device_ip}:`, error);
            }
        }
        

    } catch (err) {
        console.error('Failed to create user:', err);
    }
}
