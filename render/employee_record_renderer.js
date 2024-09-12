document.addEventListener('DOMContentLoaded', async () => {
    const recordTableEmployee = document.getElementById('table-latest-review-body-employee');
    
    try {
        const payloadVisitor = {
            personType: 1,
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
                        <td class="white-space-nowrap fs-9 ps-0 align-middle">
                            <div class="form-check mb-0 fs-8">
                                <input class="form-check-input" type="checkbox" />
                            </div>
                        </td>
                        <td class="align-middle">
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
                        <td class="align-middle">${record.personName || 'Unknown'}</td>
                        <td class="align-middle">${record.cardNo || 'N/A'}</td>
                        <td class="align-middle">${record.personSn || 'N/A'}</td>
                        <td class="align-middle">${faceFlagText}</td>
                        <td class="align-middle">${stranger}</td>
                        <td class="align-middle">${new Date(record.createTime).toLocaleString()}</td>
                    </tr>
                `;

                // Insert the row into the table body
                recordTableEmployee.insertAdjacentHTML('beforeend', row);
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
