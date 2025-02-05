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
                    await window.api.generateWristbandPDF(currentCard, ticketTypeF);
                })(sn, card);
            }
            showValidateAlert("Users created successfully!", "success");
        } catch (error) {
            console.error("Unexpected error:", error);
            showValidateAlert("An unexpected error occurred", "danger");
        }

        
    
        })

    
        document.getElementById("checkOrderForm").addEventListener("submit", async function (e) {
            e.preventDefault(); // Prevent page reload
        
            const orderNumber = document.getElementById("orderNumber").value.trim();
            if (!orderNumber) {
                alert("Please enter an order number.");
                return;
            }
        
            try {
                // Step 1: Get the auth token
                const loginResponse = await fetch("https://qbot-api.wonderpark.my/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: "cravedev@craveasia.com",
                        password: "12345678"
                    })
                });
        
                const loginData = await loginResponse.json();
                if (!loginResponse.ok) {
                    throw new Error(`Login failed: ${loginData.message}`);
                }
        
                const token = loginData.data.token;
                console.log("Token received:", token);
        
                // Step 2: Fetch order details
                const orderResponse = await fetch(`https://qbot-api.wonderpark.my/api/orders/details/admin?order_number=${orderNumber}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
        
                const orderData = await orderResponse.json();
                console.log(orderData)
                if (!orderResponse.ok) {
                    throw new Error(`Order fetch failed: ${orderData.message}`);
                }
        
                // Step 3: Display order details
                document.getElementById("orderDetailsResult").innerHTML = `
                <div class="alert alert-success">
                    <h5>Order Details</h5>
                    <p><strong>Order Number:</strong> ${orderData.data.order_number}</p>
                    <p><strong>Status:</strong> ${orderData.data.status}</p>
                    <p><strong>Customer:</strong> ${orderData.data.customer[0].first_name} ${orderData.data.customer[0].last_name}</p>
                </div>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Order Detail ID</th>
                            <th>Ticket Type</th>
                            <th>Quantity</th>
                            <th>Subtotal (RM)</th>
                            <th>Grand Total (RM)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderData.data.order_details.map(detail => `
                            ${detail.product && detail.product.product_id === 1 ? `
                            <tr>
                                <td>${detail.order_detail_id}</td>
                                <td>
              ${
                detail.addon_product.length > 0 
                  ? detail.addon_product.some(addon => addon.entry_count > 1) 
                    ? "Unlimited" 
                    : "Not Unlimited"
                  : detail.product_variant.length > 0 
                    ? detail.product_variant.some(variant => variant.entry_count > 1) 
                      ? "Unlimited" 
                      : "Not Unlimited"
                    : detail.product.entry_count > 1 
                      ? "Unlimited" 
                      : "Not Unlimited"
              }
            </td>
                                <td>${detail.quantity}</td>
                                <td>${detail.subtotal}</td>
                                <td>${detail.grand_total}</td>
                            </tr>
                            ` : ''}
                        `).join("")}
                    </tbody>
                </table>
            `;

        
            } catch (error) {
                console.error("Error:", error);
                document.getElementById("orderDetailsResult").innerHTML = `
                    <div class="alert alert-danger">Error: ${error.message}</div>
                `;
            }
        });
        
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
        await window.api.insertUserTicket(name, username, email, phone, role, image, sn, card, ticketTypeF);
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
