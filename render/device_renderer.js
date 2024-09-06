
//Add Device
document.getElementById("deviceForm").addEventListener('submit', async (event) => {
    event.preventDefault();

    const device_ip = document.getElementById("ip_address").value;
    const device_key = document.getElementById("device_key").value;
    const device_name = document.getElementById("device_name").value;
    const device_area = document.getElementById("device_area").value;
    const password = document.getElementById("password").value;
    const device_entry = document.getElementById("device_entry").value;

    try {
        await window.api.insertDevice(device_ip, device_key, device_name, device_area, password, device_entry);
        console.log("Device area inserted successfully.");
        // Optionally refresh the table or provide feedback to the user
    } catch (err) {
        console.error('Failed to insert device area:', err);
    }
})

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
                            <a class="dropdown-item open-door" href="#!" data-device-ip="${device.device_ip}" data-device-pass="${device.communication_password}"><i class="fa-solid fa-lock-open"></i> Open the door</a>
                            <a class="dropdown-item restart-device" href="#!" data-device-ip="${device.device_ip}" data-device-pass="${device.communication_password}"><i class="fa-solid fa-power-off"></i> Restart</a>
                            <a class="dropdown-item view-device" href="#!" data-device-id="${device.id}"><i class="fa-solid fa-eye"></i> View</a>
                            <div class="dropdown-divider"></div>
                            <button type="button" id="deleteDevice" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
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
    if (event.target.closest('.open-door')) {
        const openDoorLink = event.target.closest('.open-door');
        const deviceIp = openDoorLink.getAttribute('data-device-ip');
        const devicePassword = openDoorLink.getAttribute('data-device-pass');

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
            } else {
                console.error(`Failed to open the door for device ${deviceIp}`);
            }
        } catch (error) {
            console.error(`Error opening the door for device ${deviceIp}:`, error);
        }
    }
});

document.addEventListener('click', async (event) => {
    if (event.target.closest('.restart-device')) {
        const restartDeviceLink = event.target.closest('.restart-device');
        const deviceIp = restartDeviceLink.getAttribute('data-device-ip');
        const devicePass = restartDeviceLink.getAttribute('data-device-pass');

        try {
            const credentials = btoa(`admin:${devicePass}`);
            const response = await fetch(`http://${deviceIp}:8090/cgi-bin/js/device/restart`, {
                method: 'POST',
                headers: {
                    'Authorization' : `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                console.log(`restart successfully for device ${deviceIp}`);
            } else {
                console.error(`Failed to restart for device ${deviceIp}`);
            }
            
        } catch (error) {
            console.error(`Error restart for device ${deviceIp}:`, error);
        }
    }
})


//Delete Device
document.addEventListener('click', async (event) => {
    if (event.target && event.target.id === 'deleteDevice') {
        const deviceId = event.target.closest('tr').querySelector('#deviceId').value;
        
        try {
            await window.api.deleteDevice(deviceId);
            console.log("Deleted device successfully");
            showAlert("Deleted Device Successfully", "success")
            // Optionally refresh the device list or remove the row from the table
        } catch (error) {
            showAlert("Failed to delete device", "danger")
            console.error("Failed to delete device:", error);
        }
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