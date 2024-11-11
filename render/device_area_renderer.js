
document.getElementById('deviceAreaForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Collect form data using the correct IDs
    const areaName = document.getElementById('area_name').value;
    const sort = document.getElementById('sort').value || null; // Use null if not provided

    if (areaName === "") {
        showValidateAlert("Area name cannot be empty", "danger");
        return
    }

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
                    <div class="dropdown-menu dropdown-menu-end py-2"><button type="button" data-bs-toggle="modal" data-bs-target="#area${area.id}" id="deleteAreas" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                                <div class="modal fade" id="area${area.id}" tabindex="-1" aria-labelledby="verticallyCenteredModalLabel" aria-hidden="true" style="display: none;">
                                  <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                      <div class="modal-header">
                                        <h5 class="modal-title" id="area${area.id}">Remove</h5>
                                        <button class="btn btn-close p-1" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                                      </div>
                                      <div class="modal-body">
                                        <p>Confirm remove Area ?</p><br>
                                        <button type="button" id="deleteArea" data-area-id="${area.id}" data-bs-dismiss="modal" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                                      </div>
                                      
                                    </div>
                                  </div>
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
    console.log('Click event detected:', event.target);
    if (event.target && event.target.id === 'deleteArea') {
        const deviceaAreaId = event.target.getAttribute('data-area-id');
        
        try {
            await window.api.deleteDeviceArea(deviceaAreaId);
            console.log("Deleted area successfully");
            showAlert("Deleted area Successfully", "success")
            refreshTable();
            // Optionally refresh the device list or remove the row from the table
        } catch (error) {
            showAlert("Failed to delete area", "danger")
            console.error("Failed to delete area:", error);
        }
    }
});

document.addEventListener('click', async (event) => {
    console.log('Click event detected:', event.target);
    if (event.target && event.target.id === 'deleteAreas') {
        
            refreshTable();
       
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
                    <div class="dropdown-menu dropdown-menu-end py-2"><button type="button" data-bs-toggle="modal" data-bs-target="#area${area.id}" id="deleteAreas" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                                <div class="modal fade" id="area${area.id}" tabindex="-1" aria-labelledby="verticallyCenteredModalLabel" aria-hidden="true" style="display: none;">
                                  <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                      <div class="modal-header">
                                        <h5 class="modal-title" id="area${area.id}">Remove</h5>
                                        <button class="btn btn-close p-1" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                                      </div>
                                      <div class="modal-body">
                                        <p>Confirm remove Area ?</p><br>
                                        <button type="button" id="deleteArea" data-area-id="${area.id}" data-bs-dismiss="modal" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                                      </div>
                                      
                                    </div>
                                  </div>
                                </div>
                    </div>
                  </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load device areas:', err);
    } 
}