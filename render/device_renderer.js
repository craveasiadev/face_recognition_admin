
//Add Device
document.addEventListener('DOMContentLoaded', async () => {

    function isValidIpAddress(ip) {
        const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipPattern.test(ip);
    }

    document.getElementById("deviceForm").addEventListener('submit', async (event) => {

        event.preventDefault();
        const device_ip = document.getElementById("ip_address").value;
        const device_key = document.getElementById("device_key").value;
        const device_name = document.getElementById("device_name").value;
        const device_area = document.getElementById("device_area").value;
        const password = document.getElementById("password").value;
        const device_entry = document.getElementById("device_entry").value;
    
        if (!isValidIpAddress(device_ip)) {
            showValidateAlert("Please enter a valid IP address (e.g., 192.168.1.1).", "danger");
            return; // Stop the form from submitting if the IP is invalid
        }

        if (device_name === "") {
            showValidateAlert("Device name cannot be empty", "danger");
            return;
        }

        if (device_area === "") {
            showValidateAlert("Device area cannot be empty", "danger");
            return;
        }

        if (password === "") {
            showValidateAlert("Communication password cannot be empty", "danger");
            return;
        }

        try {
            await window.api.insertDevice(device_ip, device_key, device_name, device_area, password, device_entry);
            console.log("Device area inserted successfully.");
            showAlert("Added Device Successfully", "success")
            const modalElement = document.getElementById('verticallyCentered');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide();
            }
            refreshTable();
            // Optionally refresh the table or provide feedback to the user
        } catch (err) {
            console.error('Failed to insert device area:', err);
        }
    })
    
});

//Get Device Area
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



//Filter
document.addEventListener('DOMContentLoaded', async () => {
    const deviceAreaFilter = document.getElementById('area_filter');
    
    try {
        const areasFilt = await window.api.getDeviceArea();
        
        deviceAreaFilter.innerHTML = `
            <option value="" selected="selected">All</option>
            ${areasFilt.map(area => `
                <option value="${area.area_name}">${area.area_name}</option>
            `).join('')}
        `;
    } catch (err) {
        console.error('Failed to load device areas:', err);
    }
});



//Get Devices
document.addEventListener('DOMContentLoaded', async () => {
    

    refreshTable()
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-device')) {
        const deviceId = event.target.getAttribute('data-device-id');
        console.log(deviceId)
        window.location.href = `device_details.html?deviceId=${deviceId}`;
    }
});


// Handle click event for opening the door
document.addEventListener('click', async (event) => {
    // Check if the clicked element is within the '.open-door' link
    if (event.target.closest('.open-door')) {
        const openDoorLink = event.target.closest('.open-door');
        const deviceId = openDoorLink.getAttribute('data-device-id');
        console.log(`Device ID: ${deviceId}`);
        
        // Find the closest '.device-modal' div which contains the input field
        const modalDiv = openDoorLink.closest('.device-modal');
        
        if (!modalDiv) {
            console.error('Modal div not found for device:', deviceId);
            return;
        }

        // Find the input field within the modal div
        const inputField = modalDiv.querySelector(`#open-device-pass-${deviceId}`);
        if (!inputField) {
            console.error('Input field not found for device:', deviceId);
            return;
        }

        const deviceIp = openDoorLink.getAttribute('data-device-ip');
        const devicePassword = openDoorLink.getAttribute('data-device-pass');

        console.log(inputField.value);

        if (inputField.value === "1234") {  // Replace with the correct password logic
            try {
                const credentials = btoa(`admin:${devicePassword}`);
                const response = await fetch(`http://${deviceIp}:8090/cgi-bin/js/device/output`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "type": "1",
                        "content": {}
                    })
                });

                if (response.ok) {
                    console.log(`Door opened successfully for device ${deviceIp}`);
                    showAlert(`Door opened successfully for device ${deviceIp}`, "success");
                } else {
                    console.error(`Failed to open the door for device ${deviceIp}`);
                    showAlert(`Failed to open the door for device ${deviceIp}`, "danger");
                }
            } catch (error) {
                console.error(`Error opening the door for device ${deviceIp}:`, error);
                showAlert(`Failed to open the door for device ${deviceIp}`, "danger");
            }
        } else {
            showAlert(`Incorrect Password`, "danger");
        }
    }
});


document.addEventListener('click', async (event) => {
    if (event.target.closest('.restart-device')) {
        const restartDeviceLink = event.target.closest('.restart-device');
        const deviceId = restartDeviceLink.getAttribute('data-device-id');
        
        // Find the closest modal div and fetch the input field within it
        const modalDiv = restartDeviceLink.closest('.device-modal');
        if (!modalDiv) {
            console.error('Modal div not found for device:', deviceId);
            return;
        }

        // Get the value of the password input inside the modal
        const restartDevicePass = modalDiv.querySelector(`#restart-device-pass-${deviceId}`).value;
        const deviceIp = restartDeviceLink.getAttribute('data-device-ip');
        const devicePass = restartDeviceLink.getAttribute('data-device-pass');

        if (restartDevicePass === "1234") {  // Replace with the correct password logic
            try {
                const credentials = btoa(`admin:${devicePass}`);
                const response = await fetch(`http://${deviceIp}:8090/cgi-bin/js/device/restart`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });

                if (response.ok) {
                    console.log(`Restarted successfully for device ${deviceIp}`);
                    showAlert(`Restarted successfully for device ${deviceIp}`, "success");
                } else {
                    console.error(`Failed to restart for device ${deviceIp}`);
                    showAlert(`Failed to restart for device ${deviceIp}`, "danger");
                }
            } catch (error) {
                console.error(`Error restarting device ${deviceIp}:`, error);
                showAlert(`Failed to restart for device ${deviceIp}`, "danger");
            }
        } else {
            showAlert(`Incorrect Password`, "danger");
        }
    }
});



//Delete Device
document.addEventListener('click', async (event) => {
    if (event.target && event.target.id === 'deleteDevice') {
        const row = event.target.closest('tr');
        const deviceId = row.querySelector('.view-device').getAttribute('data-device-id');
        
        try {
            await window.api.deleteDevice(deviceId);
            console.log("Deleted device successfully");
            showAlert("Deleted Device Successfully", "success")
            refreshTable();
            // Optionally refresh the device list or remove the row from the table
        } catch (error) {
            showAlert("Failed to delete device", "danger")
            console.error("Failed to delete device:", error);
        }
    }
});

document.addEventListener('click', async (event) => {
    console.log('Click event detected:', event.target);
    if (event.target && event.target.id === 'deleteDevice') {
        const deviceId = event.target.getAttribute('data-device-id');
        
        try {
            await window.api.deleteDevice(deviceId);
            console.log("Deleted device successfully");
            showAlert("Deleted device Successfully", "success")
            refreshTable();
            // Optionally refresh the device list or remove the row from the table
        } catch (error) {
            showAlert("Failed to delete device", "danger")
            console.error("Failed to delete device:", error);
        }
    }
});

document.addEventListener('click', async (event) => {
    console.log('Click event detected:', event.target);
    if (event.target && event.target.id === 'deleteDevices') {
        
            refreshTable();
       
    }
});

document.addEventListener('click', async (event) => {
    console.log('Click event detected:', event.target);
    if (event.target && event.target.id === 'openDevices') {
        
            refreshTable();
       
    }
});

document.addEventListener('click', async (event) => {
    console.log('Click event detected:', event.target);
    if (event.target && event.target.id === 'restartDevices') {
        
            refreshTable();
       
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

function showValidateAlert(message, type) {
    const alertContainer = document.getElementById('validate-alert-container');
    
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
    const deviceTable = document.getElementById('table-latest-review-body');

    try {
        const devices = await window.api.getDevice();

        // Render all devices with default "Offline" status and person count as 0
        deviceTable.innerHTML = devices.map(device => `
            <tr class="">
                <td class="fs-9 align-middle text-center">
                    <div class="form-check mb-0 fs-8 text-center">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle serial border-end border-translucent">${device.device_key}</td>
                <td class="align-middle name border-end border-translucent">${device.device_name}</td>
                <td class="align-middle state border-end border-translucent">
                    <span class="badge badge-phoenix fs-10 badge-phoenix-danger">
                        <span class="badge-label">Offline</span>
                        <span class="ms-1" data-feather="x" style="height:12.8px;width:12.8px;"></span>
                    </span>
                </td>
                <td class="align-middle ip border-end border-translucent">${device.device_ip}</td>
                <td class="align-middle direction border-end border-translucent">${device.device_entry}</td>
                <td class="align-middle person border-end border-translucent">0</td>
                <td class="align-middle area border-end border-translucent">${device.area_name}</td>
                <td class="align-middle created border-end border-translucent">${new Date(device.created_at).toLocaleString()}</td>
                <td class="align-middle white-space-nowrap text-center">
                    <div class="btn-reveal-trigger position-static">
                        <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                        <div class="dropdown-menu dropdown-menu-end py-2">
                            <a class="dropdown-item" id="openDevices" data-bs-toggle="modal" data-bs-target="#open-device${device.id}" href="#!" ><i class="fa-solid fa-lock-open"></i> Open the door</a>
                                <div class="modal fade" id="open-device${device.id}" tabindex="-1" aria-labelledby="openDevice" aria-hidden="true" style="display: none;">
                                  <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                      <div class="modal-header">
                                        <h5 class="modal-title">Enter Password</h5>
                        
                                        <button class="btn btn-close p-1" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                                      </div>
                                      <div class="modal-body">
                                        <div class="device-modal">
                                        <input type="text" class="form-control mb-3" id="open-device-pass-${device.id}">
                                        <a class="btn btn-primary open-door" data-bs-dismiss="modal" href="#!" data-device-ip="${device.device_ip}" data-device-pass="${device.communication_password}" data-device-id="${device.id}"><i class="fa-solid fa-lock-open"></i> Open the door</a>
                                        </div>
                                        
                                      </div>
                                      
                                    </div>
                                  </div>
                                </div>
                            <a class="dropdown-item" id="restartDevices" data-bs-toggle="modal" data-bs-target="#restart-device${device.id}" href="#!"><i class="fa-solid fa-power-off"></i> Restart</a>
                                <div class="modal fade" id="restart-device${device.id}" tabindex="-1" aria-labelledby="verticallyCenteredModalLabel" aria-hidden="true" style="display: none;">
                                  <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                      <div class="modal-header">
                                        <h5 class="modal-title">Enter Password</h5>
                                        <button class="btn btn-close p-1" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                                      </div>
                                      <div class="modal-body">
                                        <div class="device-modal">
                                        <input type="text" class="form-control mb-3" id="restart-device-pass-${device.id}">
                                        <a class="btn btn-primary restart-device" data-bs-dismiss="modal" href="#!" data-device-ip="${device.device_ip}" data-device-pass="${device.communication_password}" data-device-id="${device.id}"><i class="fa-solid fa-power-off"></i> Restart</a>
                                        </div>
                                        
                                      </div>
                                      
                                    </div>
                                  </div>
                                </div>
                            <a class="dropdown-item view-device" href="#!" data-device-id="${device.id}"><i class="fa-solid fa-eye"></i> View</a>
                            <div class="dropdown-divider"></div>
                            <button type="button" data-bs-toggle="modal" data-bs-target="#device${device.id}" id="deleteDevices" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                                <div class="modal fade" id="device${device.id}" tabindex="-1" aria-labelledby="verticallyCenteredModalLabel" aria-hidden="true" style="display: none;">
                                  <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                      <div class="modal-header">
                                        <h5 class="modal-title" id="device${device.id}">Remove</h5>
                                        <button class="btn btn-close p-1" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                                      </div>
                                      <div class="modal-body">
                                        <p>Confirm remove Device ?</p><br>
                                        <button type="button" id="deleteDevice" data-device-id="${device.id}" data-bs-dismiss="modal" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                                      </div>
                                      
                                    </div>
                                  </div>
                                </div>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');

        // Initialize List.js after rendering the table
        const options = {
            valueNames: ['serial', 'name', 'state', 'ip', 'direction', 'last', 'person', 'area', 'created'],
            page: 6,
            pagination: true
        };
        const deviceList = new List('device-list-container', options);

        // Set up the area filter
        const deviceAreaFilter = document.getElementById('area_filter');
        deviceAreaFilter.addEventListener('change', function() {
            const filterValue = this.value;
            if (filterValue) {
                deviceList.filter(item => item.values().area === filterValue);
            } else {
                deviceList.filter(); // Show all items if no filter is applied
            }
        });

        // After rendering the list, check the status of each device
        for (let device of devices) {
            try {
                const credentials = btoa(`admin:${device.communication_password}`);
                const response = await fetch(`http://${device.device_ip}:8090/cgi-bin/js/device/get`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`
                    }
                });

                // Debugging: Check response status and body
                console.log(`Response status for device ${device.device_ip}:`, response.status);
                const data = await response.json();
                console.log(`Response body for device ${device.device_ip}:`, data);

                // Find the row for the current device
                const rows = deviceTable.querySelectorAll('tr');
                for (let row of rows) {
                    const ipCell = row.querySelector('.ip');
                    if (ipCell && ipCell.textContent === device.device_ip) {
                        // Update status and person count based on API response
                        row.querySelector('.state').innerHTML = `
                            <span class="badge badge-phoenix fs-10 badge-phoenix-success">
                                <span class="badge-label">Online</span>
                                <span class="ms-1" data-feather="check" style="height:12.8px;width:12.8px;"></span>
                            </span>
                        `;
                        row.querySelector('.person').textContent = data.data.personCount || 0;
                        break;
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch data for device ${device.device_ip}:`, error);
            }
        }

    } catch (err) {
        console.error('Failed to load devices:', err);
    }

    
}
