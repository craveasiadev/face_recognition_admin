document.addEventListener('DOMContentLoaded', async () => {
    const recordTableVisitor = document.getElementById('table-latest-review-body-visitor');
    const loading = document.getElementById("loading-spinner");
    
    try {

        const userRecord = await window.api.getGateRecordVisitor();
        console.log(userRecord)

        if (userRecord.length > 0) {
            recordTableVisitor.innerHTML = userRecord.map(record => `
                <tr>
                    <td class="white-space-nowrap fs-9 ps-0 align-middle">
                        <div class="form-check mb-0 fs-8">
                            <input class="form-check-input" type="checkbox" />
                        </div>
                    </td>
                    <td class="align-middle image border-end border-translucent">
                    ${record.checkImgUrl === "Using QR" ? `
                        <p> Using QR</p>
                        ` : `
                        <a href="#" data-bs-toggle="modal" data-bs-target="#${record.id}">
                           <img src="data:image/jpeg;base64,${record.checkImgUrl}" alt="Snapshot" width="80" height="80" style="border-radius: 10%" />
                        </a>
                        <div class="modal fade" id="${record.id}" tabindex="-1" aria-labelledby="${record.id}" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="${record.id}">${record.personName || 'Unknown'}</h5>
                              <button class="btn btn-close p-1" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <a href="data:image/jpeg;base64,${record.checkImgUrl}" class="btn btn-info mb-3 w-100" download>Save Image</a>
                                <img src="data:image/jpeg;base64,${record.checkImgUrl}" alt="Snapshot" class="img-fluid" />
                            </div>
                          </div>
                        </div>
                        `}
                      </div>
                    </td>
                    <td class="align-middle personName border-end border-translucent">${record.personName || 'Unknown'}</td>
                    <td class="align-middle cardNo border-end border-translucent">${record.cardNo || 'N/A'}</td>
                    <td class="align-middle personSn border-end border-translucent">${record.personSn || 'N/A'}</td>
                    <td class="align-middle openDoor border-end border-translucent">${record.openDoorFlag}</td>
                    <td class="align-middle stranger border-end border-translucent">${record.strangerFlag}</td>
                    <td class="align-middle created border-end border-translucent">${new Date(Math.floor(record.createTime)).toLocaleString()}</td>
                    <td class="align-middle white-space-nowrap text-center">
                        <div class="btn-reveal-trigger position-static">
                            <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                            <div class="dropdown-menu dropdown-menu-end py-2">
                                <button type="button" id="deleteRecord" data-record-id="${record.id}" class="dropdown-item text-danger deleteRecord"><i class="fa-solid fa-trash"></i> Remove</button>
                            </div>
                        </div>
                    </td>
                </tr>
            `)

            const options = {
                valueNames: ['image', 'personName', 'cardNo', 'personSn', 'openDoor', 'stranger', 'created'],
                page: 6,
                pagination: true
            };
            new List('visitor-record-list-container', options);
        } else {
            recordTableVisitor.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">No data available</td>
                </tr>
            `
        }
        
        loading.style.display = "none";
    } catch (err) {
        console.error('Failed to load device areas:', err);
    }

    document.addEventListener('click', async (event) => {
        console.log('Click event detected:', event.target);
        if (event.target && event.target.id === 'deleteRecord') {
            const row = event.target.closest('tr');
            const recordId = row.querySelector('.deleteRecord').getAttribute('data-record-id');
            
            try {
                await window.api.deleteUserRecord(recordId);
                console.log("Deleted device successfully");
                
                refreshTable();
                // Optionally refresh the device list or remove the row from the table
            } catch (error) {
                
                console.error("Failed to delete device:", error);
            }
        }
    });
    

    const refresh = document.getElementById("refresh-btn")
    refresh.addEventListener("click", () => {
        window.location.reload();
    })

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
        const recordTableVisitor = document.getElementById('table-latest-review-body-visitor');
        
        try {
            const userRecord = await window.api.getUserRecordVisitor();
        console.log(userRecord)

        if (userRecord.length > 0) {
            recordTableVisitor.innerHTML = userRecord.map(record => `
                <tr>
                    <td class="white-space-nowrap fs-9 ps-0 align-middle">
                        <div class="form-check mb-0 fs-8">
                            <input class="form-check-input" type="checkbox" />
                        </div>
                    </td>
                    <td class="align-middle border-end border-translucent">
                    ${record.checkImgUrl === "Using QR" ? `
                        <p> Using QR</p>
                        ` : `
                        <a href="#" data-bs-toggle="modal" data-bs-target="#${record.id}">
                           <img src="data:image/jpeg;base64,${record.checkImgUrl}" alt="Snapshot" width="80" height="80" style="border-radius: 10%" />
                        </a>
                        <div class="modal fade" id="${record.id}" tabindex="-1" aria-labelledby="${record.id}" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="${record.id}">${record.personName || 'Unknown'}</h5>
                              <button class="btn btn-close p-1" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <a href="data:image/jpeg;base64,${record.checkImgUrl}" class="btn btn-info mb-3 w-100" download>Save Image</a>
                                <img src="data:image/jpeg;base64,${record.checkImgUrl}" alt="Snapshot" class="img-fluid" />
                            </div>
                          </div>
                        </div>
                        `}
                      </div>
                    </td>
                    <td class="align-middle border-end border-translucent">${record.personName || 'Unknown'}</td>
                    <td class="align-middle border-end border-translucent">${record.cardNo || 'N/A'}</td>
                    <td class="align-middle border-end border-translucent">${record.personSn || 'N/A'}</td>
                    <td class="align-middle border-end border-translucent">${record.openDoorFlag}</td>
                    <td class="align-middle border-end border-translucent">${record.strangerFlag}</td>
                    <td class="align-middle border-end border-translucent">${new Date(Math.floor(record.createTime)).toLocaleString()}</td>
                    <td class="align-middle white-space-nowrap text-center">
                        <div class="btn-reveal-trigger position-static">
                            <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                            <div class="dropdown-menu dropdown-menu-end py-2">
                                <button type="button" id="deleteRecord" data-record-id="${record.id}" class="dropdown-item text-danger deleteRecord"><i class="fa-solid fa-trash"></i> Remove</button>
                            </div>
                        </div>
                    </td>
                </tr>
            `)
        } else {
            recordTableVisitor.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">No data available</td>
                </tr>
            `
        }
        
        } catch (err) {
            console.error('Failed to refresh the table:', err);
        }
    
        
    }
    
});
