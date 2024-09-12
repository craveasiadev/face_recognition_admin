document.addEventListener('DOMContentLoaded', async () => {
    const recordTableBlacklist = document.getElementById('table-latest-review-body-blacklist');
    const loading = document.getElementById("loading-spinner");
    
    try {
        const payloadVisitor = {
            personType: 3,
            index: 1,
            length: 20,
            order: 0
        };

        const devices = await window.api.getDevice();
        console.log(devices)
        
        devices.map(async (device) => {
            const recordURL = `http://${device.device_ip}:8090/cgi-bin/js/record/findList`;

            const response = await fetch(recordURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                },
                body: JSON.stringify(payloadVisitor)
            });

            if (!response.ok) {
                throw new Error(`Error with device ${device.device_ip}`);
            }

            const result = await response.json();
            const data = result.data;  // The array of visitor records

            // For each record in the data array, append a row to the table
            data.forEach((record) => {
                const faceFlagText = record.openDoorFlag === 1 ? 'YES' : 'NO';
                const stranger = record.strangerFlag === 1 ? 'Stranger' : 'Registered Employee'
                const row = `
                    <tr>
                        <td class="fs-9 ps-0 align-middle">
                            <div class="form-check mb-0 fs-8">
                                <input class="form-check-input" type="checkbox" />
                            </div>
                        </td>
                        <td class="align-middle border-end border-translucent">
                            <a href="#" data-bs-toggle="modal" data-bs-target="#${record.id}">
                               <img src="${record.checkImgUrl}" alt="Snapshot" width="80" height="80" style="border-radius: 10%" />
                            </a>
                            <div class="modal fade" id="${record.id}" tabindex="-1" aria-labelledby="${record.id}" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                              <div class="modal-content">
                                <div class="modal-header">
                                  <h5 class="modal-title" id="${record.id}">${record.personName}</h5><br>
                                  
                                  <button class="btn btn-close p-1" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <a href="${record.checkImgUrl}" class="btn btn-info mb-3 w-100" download>Save Image</a>
                                    <img src="${record.checkImgUrl}" alt="Snapshot" class="img-fluid" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="align-middle border-end border-translucent">${record.personName || 'Unknown'}</td>
                        <td class="align-middle border-end border-translucent">${record.cardNo || 'N/A'}</td>
                        <td class="align-middle border-end border-translucent">${record.personSn || 'N/A'}</td>
                        <td class="align-middle border-end border-translucent">${faceFlagText}</td>
                        <td class="align-middle border-end border-translucent">${stranger}</td>
                        <td class="align-middle border-end border-translucent">${new Date(record.createTime).toLocaleString()}</td>
                        <td class="align-middle white-space-nowrap text-center">
                            <div class="btn-reveal-trigger position-static">
                                <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                                <div class="dropdown-menu dropdown-menu-end py-2">
                                    <button type="button" id="deleteRecord" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;

                // Insert the row into the table body
                recordTableBlacklist.insertAdjacentHTML('beforeend', row);
                loading.style.display = "none";
            });
        });
    } catch (err) {
        console.error('Failed to load device areas:', err);
    }

    const refresh = document.getElementById("refresh-btn")
    refresh.addEventListener("click", () => {
        window.location.reload();
    })
});
