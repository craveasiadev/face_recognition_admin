
document.getElementById('deviceAreaForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Collect form data using the correct IDs
    const areaName = document.getElementById('area_name').value;
    const sort = document.getElementById('sort').value || null; // Use null if not provided

    try {
        await window.api.insertDeviceArea(areaName, sort);
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
});


document.addEventListener('DOMContentLoaded', async () => {
    const deviceAreaTable = document.getElementById('table-latest-review-body');
    
    try {
        const areas = await window.api.getDeviceArea();
        
        deviceAreaTable.innerHTML = areas.map(area => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle border-end border-translucent">${area.area_name}</td>
                <td class="align-middle border-end border-translucent">${area.sort || ''}</td>
                <td class="align-middle border-end border-translucent">${new Date(area.created_at).toLocaleString()}</td>
                <td class="align-middle white-space-nowrap text-end pe-0">
                  <div class="btn-reveal-trigger position-static">
                    <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                    <div class="dropdown-menu dropdown-menu-end py-2"><a class="dropdown-item" href="#!">View</a>
                      <input type="hidden" id="deviceAreaId" value="${area.id}">
                      <div class="dropdown-divider"></div><button type="buton" id="deleteDeviceArea" class="dropdown-item text-danger">Remove</button>
                    </div>
                  </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load device areas:', err);
    }
});

//Delete Device
document.addEventListener('click', async (event) => {
    if (event.target && event.target.id === 'deleteDeviceArea') {
        const deviceaAreaId = event.target.closest('tr').querySelector('#deviceAreaId').value;
        
        try {
            await window.api.deleteDeviceArea(deviceaAreaId);
            console.log("Deleted device area successfully");
            // Optionally refresh the device list or remove the row from the table
        } catch (error) {
            console.error("Failed to delete device area:", error);
        }
    }
});

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
    const deviceAreaTable = document.getElementById('table-latest-review-body');
    
    try {
        const areas = await window.api.getDeviceArea();
        
        deviceAreaTable.innerHTML = areas.map(area => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle border-end border-translucent">${area.area_name}</td>
                <td class="align-middle border-end border-translucent">${area.sort || ''}</td>
                <td class="align-middle border-end border-translucent">${new Date(area.created_at).toLocaleString()}</td>
                <td class="align-middle white-space-nowrap text-end pe-0">
                  <div class="btn-reveal-trigger position-static">
                    <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                    <div class="dropdown-menu dropdown-menu-end py-2"><a class="dropdown-item" href="#!">View</a>
                      <input type="hidden" id="deviceAreaId" value="${area.id}">
                      <div class="dropdown-divider"></div><button type="buton" id="deleteDeviceArea" class="dropdown-item text-danger">Remove</button>
                    </div>
                  </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load device areas:', err);
    } 
}