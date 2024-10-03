// renderer.js
document.addEventListener('DOMContentLoaded', async () => {
    const userTableBody = document.getElementById('table-latest-review-body');
    const loading = document.getElementById("loading-spinner");
    
    try {
        let allUser = [];
        let indexCount = 1;
        let hasData = true;
        
        // Function to fetch data from a single device
        async function fetchDataFromDevice(device, payload) {
            const url = `http://${device.device_ip}:8090/cgi-bin/js/person/findList`;
        
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                    },
                    body: JSON.stringify(payload)
                });
        
                const result = await response.json();
                return result.data;
            } catch (error) {
                console.error(`Error fetching data from ${device.device_ip}:`, error);
                return null;
            }
        }
        
        // Function to fetch image data using the user SN
        async function fetchImageFromDevice(device_ip, userSn, com_pass) {
            const url = `http://${device_ip}:8090/cgi-bin/js/face/find`;
        
            const payload = {
                personSn: userSn
            };
        
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('admin:' + com_pass)
                    },
                    body: JSON.stringify(payload)
                });
        
                const result = await response.json();
                if (result && result.data) {
                    // Return the base64 image or empty string if no image found
                    return result.data.imgBase64 || "";
                }
            } catch (error) {
                console.error(`Error fetching image for userSn ${userSn} from ${device_ip}:`, error);
                return "";
            }
            return "";
        }
        
        while (hasData) {
            // console.log(indexCount);
        
            const payload = {
                index: indexCount,
                length: 10
            };
        
            const alldevices = await window.api.getAllDevices();
        
            // Flag to track if any device has more data
            let dataFound = false;
        
            // Use for...of to handle asynchronous fetching properly
            for (const device of alldevices) {
                const data = await fetchDataFromDevice(device, payload);
        
                if (data && data.length > 0) {
                    // console.log(data.length);
                    // For each user, fetch their image
                    for (const user of data) {
                        // console.log(user.sn)
                        const imgBase64 = await fetchImageFromDevice(device.device_ip, user.sn, device.communication_password);
                        // Add the user and the image to the allUser array
                        allUser.push({
                            ...user, // Include the rest of the user data
                            imgBase64 // Add the image
                        });
                    }
        
                    dataFound = true; // Set flag to true if data is found
                }
            }
        
            // If no device returned any data, stop the loop
            if (!dataFound) {
                hasData = false;
            } else {
                indexCount++; // Increment the index to fetch the next set of data
            }
        }
        
        // Function to check and insert user data into the database
        async function checkAndInsertUser(record) {
            try {
                // Check if the user with the same cardNo exists
                const existingUser = await window.api.getUserByCard(record.cardNo);
        
                if (!existingUser) {
                    // If no existing user, insert the new user with image
                    await window.api.insertUser(
                        record.name, 
                        "", 
                        "", 
                        "", 
                        2, 
                        record.imgBase64 || "", // Use the image data, or empty if none
                        record.sn, 
                        record.cardNo
                    );
                    console.log(`Inserted user: ${record.name}`);
                } else {
                    // console.log(`User with card number ${record.cardNo} already exists, skipping insertion.`);
                }
            } catch (error) {
                console.error('Error during user insertion:', error);
            }
        }
        
        //Once data is fetched, insert into the database
        allUser.forEach(async (record) => {
            await checkAndInsertUser(record);
        });
                

        const users = await window.api.getUsersVisitor();
        
        
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle border-end border-translucent">${user.name}</td>
                <td class="align-middle border-end border-translucent">${user.email}</td>
                <td class="align-middle border-end border-translucent">${user.phone}</td>
                <td class="align-middle border-end border-translucent">${user.role_name}</td>
                <td class="align-middle text-center border-end border-translucent">
                ${user.profile_image === "no image" ? 
                    `<span>No image</span>` : 
                    `<img src="../uploads/${user.profile_image}" alt="${user.name}" 
                     style="width: 110px; height: 110px; object-fit: cover; border-radius: 10%;" />`}
                </td>
                <td class="align-middle border-end border-translucent">${user.card_number}</td>
                <td class="align-middle border-end border-translucent">${user.created_at}</td>
                <td class="align-middle white-space-nowrap text-center">
                    <div class="btn-reveal-trigger position-static">
                        <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                        <div class="dropdown-menu dropdown-menu-end py-2">
                            <a class="dropdown-item view-user" href="#!" data-user-id="${user.id}"><i class="fa-solid fa-eye"></i> View</a>
                            <div class="dropdown-divider"></div>
                            <button type="button" id="deleteUser" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');

        loading.style.display = "none";
    } catch (err) {
        console.error('Failed to load users:', err);
    }

    function generateUserSN(length = 7) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let userSN = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            userSN += characters[randomIndex];
        }
        return userSN;
    }

    document.getElementById("visitorForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const sn = generateUserSN();
        const card = document.getElementById("card").value;
        const role = 2;
        const area = document.getElementById("device_area").value;
        const username = document.getElementById("name").value;

         // Check if image is from the camera (base64) or file upload
        const imageInput = document.getElementById("imageData");
        let image = imageInput.value;
    
        // If the user used file upload
        const fileInput = document.querySelector('.use-file input[type="file"]');
        if (fileInput && fileInput.files.length > 0) {
            // Get the file
            const file = fileInput.files[0];
            const fileReader = new FileReader();
    
            // Read the file as base64 and process it
            fileReader.onloadend = async function() {
                image = fileReader.result; // This will give base64 image data
    
                // Proceed with the form submission using the base64 data
                await submitForm(name, username, email, phone, role, image, sn, card, area);
            };
    
            fileReader.readAsDataURL(file); // Convert file to base64
        } else {
            // If the user used the camera, `imageInput.value` is already set to base64
            await submitForm(name, username, email, phone, role, image, sn, card, area);
        }
    
        })
});

//delete User
document.addEventListener('click', async (event) => {
    console.log('Click event detected:', event.target);
    if (event.target && event.target.id === 'deleteUser') {
        const row = event.target.closest('tr');
        const userId = row.querySelector('.view-user').getAttribute('data-user-id');
        
        try {
            await window.api.deleteUser(userId);
            console.log("Deleted user successfully");
            showAlert("Deleted User Successfully", "success")
            refreshTable();
            // Optionally refresh the device list or remove the row from the table
        } catch (error) {
            showAlert("Failed to delete user", "danger")
            console.error("Failed to delete user:", error);
        }
    }
});

// Helper function to submit form data
async function submitForm(name, username, email, phone, role, image, sn, card, area) {
    try {
        await window.api.insertUser(name, username, email, phone, role, image, sn, card);
        console.log("User created successfully.");
        showAlert("User added successfully", "success");

        const modalElement = document.getElementById('verticallyCentered');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modal.hide();
        }

        const devices = await window.api.getDeviceByArea(area);
        console.log("Area ID:", area); // Add this to verify the value passed to the function
        console.log("user sn:", sn);
        console.log("Devices fetched:", devices); // Already there

        const payload = {
            type: 2,
            sn: sn,
            name: name,
            cardNo: card,
            acGroupNumber: 0,
            verifyStyle: 0,
            expiredStyle: 0,
            validTimeBegin: Date.now(),
            validTimeEnd: Date.now() + (1000 * 60 * 60 * 24 * 365) // 1-year expiration
        };

        let cleanedBase64 = image.substr(image.indexOf('base64,') + 7);
        console.log(cleanedBase64)
        const facePayload = {
            personSn: sn,
            imgBase64: cleanedBase64,
            easy: 1,
        }

        devices.map(async (device) => {
            const deviceUrl = `http://${device.device_ip}:8090/cgi-bin/js/person/create`;
            const deviceFaceUrl = `http://${device.device_ip}:8090/cgi-bin/js/face/merge`;

            const response = await fetch(deviceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                },
                body: JSON.stringify(payload)
            });

            const responseFace = await fetch(deviceFaceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                },
                body: JSON.stringify(facePayload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error adding user to device ${device.device_ip}:`, errorText);
                throw new Error(`Error with device ${device.device_ip}`);
            } else {
                console.log(`User added to device ${device.device_ip} successfully`);
            }

            if (!responseFace.ok) {
                const errorText = await responseFace.text();
                console.error(`Error adding user face to device ${device.device_ip}:`, errorText);
                throw new Error(`Error with device ${device.device_ip}`);
            } else {
                console.log(`User face added to device ${device.device_ip} successfully`);
            }

            // window.location.reload();
        });

        refreshTable(); // Refresh table after adding user
    } catch (err) {
        console.error('Failed to create user:', err);
    }
}

//get device area
document.addEventListener('DOMContentLoaded', async () => {
    const deviceAreaList = document.getElementById('device_area');
    
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


// Function to show alert messages
function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.style.display = 'block';
    
    // Automatically hide the alert after 3 seconds
    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 3000);
}

async function refreshTable() {
    const userTableBody = document.getElementById('table-latest-review-body');
    
    try {
        const users = await window.api.getUsersVisitor();
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle border-end border-translucent">${user.name}</td>
                <td class="align-middle border-end border-translucent">${user.email}</td>
                <td class="align-middle border-end border-translucent">${user.phone}</td>
                <td class="align-middle border-end border-translucent">${user.role_name}</td>
                <td class="align-middle text-center border-end border-translucent">
                    <img src="../uploads/${user.profile_image}" alt="${user.name}" style="width: 110px; height: 110px; object-fit: cover; border-radius: 10%;"/>
                </td>
                <td class="align-middle border-end border-translucent">${user.card_number}</td>
                <td class="align-middle border-end border-translucent">${user.created_at}</td>
                <td class="align-middle white-space-nowrap text-center">
                    <div class="btn-reveal-trigger position-static">
                        <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                        <div class="dropdown-menu dropdown-menu-end py-2">
                            <a class="dropdown-item view-user" href="#!" data-user-id="${user.id}"><i class="fa-solid fa-eye"></i> View</a>
                            <div class="dropdown-divider"></div>
                            <button type="button" id="deleteUser" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to refresh the table:', err);
    }

    
}