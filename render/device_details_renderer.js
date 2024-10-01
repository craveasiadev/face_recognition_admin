//Device Details 
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const deviceId = urlParams.get('deviceId');

  if (deviceId) {
      try {
          // Fetch the device details by ID from the backend
          const device = await window.api.getdevicebyid(deviceId);
          const areas = await window.api.getDeviceArea();

          // Ensure the `device-details` element exists before interacting with it
          const deviceDetails = document.getElementById('device-details');
          if (!deviceDetails) {
              console.error('Device details container not found!');
              return;
          }

          // Render the basic device information first
          deviceDetails.innerHTML = `
              <form id="edit-device-details">
                  <h4 class="mb-4">Device Information</h4>
                  <input type="hidden" id="device_id" value="${device.id}" />
                  <div class="row g-3">
                      <div class="col-md-12">
                          <div class="form-floating">
                              <input class="form-control" type="text" name="serial" id="serial" placeholder="Device Key/SN" value="${device.device_key}" />
                              <label for="add-property-wizardwizard-name">Device Key/SN</label>
                          </div>
                      </div>
                      <div class="col-md-6">
                          <div class="form-floating">
                              <input class="form-control" type="text" name="name" id="name" placeholder="Device Name" value="${device.device_name}" />
                              <label for="add-property-wizardwizard-name">Device Name</label>
                          </div>
                      </div>
                      <div class="col-md-6">
                          <div class="form-floating">
                              <input class="form-control" type="text" name="ip" id="ip" placeholder="Device IP" value="${device.device_ip}" />
                              <label for="add-property-wizardwizard-name">Device IP</label>
                          </div>
                      </div>
                      <div class="col-md-6">
                          <div class="form-floating">
                              <select class="form-select" name="entry" id="entry">
                                  <option value="In" ${device.device_entry === "In" ? "selected" : ""}>In</option>
                                  <option value="Out" ${device.device_entry === "Out" ? "selected" : ""}>Out</option>
                                  <option value="In/Out" ${device.device_entry === "In/Out" ? "selected" : ""}>In/Out</option>
                              </select>
                              <label for="add-property-wizardwizard-name">Device Entry</label>
                          </div>
                      </div>
                      <div class="col-md-6">
                          <div class="form-floating">
                              <select class="form-select" name="area" id="area">
                                  ${areas.map(area => `
                                      <option value="${area.id}" ${device.device_area_id == area.id ? "selected" : ""}>${area.area_name}</option>
                                  `)}
                              </select>
                              <label for="add-property-wizardwizard-name">Device Area</label>
                          </div>
                      </div>
                  </div>
                  
                  <!-- Placeholder for additional details -->
                  <h4 class="mb-4 mt-5">Device Additional Information</h4>
                  <div id="additional-details">
                      
                      <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                      
                      </div>
                  </div>
                 
                  <button class="btn btn-primary mt-5 w-100" type="submit">Save</button>
                  <button id="refreshButton" type="button" class="btn btn-sm btn-outline-info w-100 mt-3"><i class="fa-solid fa-arrows-rotate"></i> Refresh</button>
                  
              </form>
          `;

          document.getElementById('refreshButton').addEventListener('click', () => {
              // Refresh the page
              window.location.href = `device_details.html?deviceId=${deviceId}`;
          });

          //edit details function
          document.getElementById("edit-device-details").addEventListener('submit', async (event) => {
            event.preventDefault();
            const device_id = document.getElementById("device_id").value;
            const device_ip = document.getElementById("ip").value;
            const device_key = document.getElementById("serial").value;
            const device_name = document.getElementById("name").value;
            const device_area = document.getElementById("area").value;
            const device_entry = document.getElementById("entry").value;
          
            try {
                await window.api.updateDevice(device_id, device_ip, device_key, device_name, device_area, device_entry);
                console.log("Device area inserted successfully.");
                // Add ?success to the current URL without refreshing the page
                const newUrl = `${window.location.pathname}?deviceId=${device_id}&success=1`;
                window.history.replaceState(null, null, newUrl);
                // Optionally refresh the table or provide feedback to the user
            } catch (err) {
                console.error('Failed to insert device area:', err);
            }
          });
          
          //setPassword Function
          document.getElementById("edit-comm-pass").addEventListener("submit", async (event) => {
            event.preventDefault();
            const oldPass = document.getElementById("old_pass").value;
            const newPass = document.getElementById("new_pass").value;
            console.log(newPass)
            try {
                await window.api.updatePass(deviceId, newPass);
                console.log("Device password updated successfully.");
                // Add ?success to the current URL without refreshing the page
                const newUrl = `${window.location.pathname}?deviceId=${deviceId}&success=1`;
                window.history.replaceState(null, null, newUrl);
                window.location.reload();
                // Optionally refresh the table or provide feedback to the user
            } catch (err) {
                console.error('Failed to insert device area:', err);
            }

            const apiUrl = `http://${device.device_ip}:8090/cgi-bin/js/device/setPwd`;
            const commPassword = device.communication_password;
  
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(`admin:${commPassword}`), // Basic auth using device password
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  "oldPwd": oldPass,
                  "newPwd": newPass
              })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch additional device details');
            }
          })


          const urlParams = new URLSearchParams(window.location.search);
          const successAlert = document.getElementById("successAlert");
        
          if (urlParams.has('success')) {
            successAlert.style.display = "block";
          }

          // Now fetch additional details
          const apiUrl = `http://${device.device_ip}:8090/cgi-bin/js/device/get`;
          const commPassword = device.communication_password;

          const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                  'Authorization': 'Basic ' + btoa(`admin:${commPassword}`), // Basic auth using device password
                  'Content-Type': 'application/json'
              }
          });

          if (!response.ok) {
              throw new Error('Failed to fetch additional device details');
          }

          const additionalDetails = await response.json();

          // Check if API returned data successfully
          if (additionalDetails.code !== '000') {
              throw new Error('API returned an error: ' + additionalDetails.msg);
          }

          const data = additionalDetails.data;

          // Fill the additional device details if available
          document.getElementById('additional-details').innerHTML = `
                <div class="row g-3">
                  <div class="col-md-12">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="firmwareVersion" value="${data.firmwareVersion}"  disabled="disabled" />
                      <label for="firmwareVersion">Firmware Version</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="cpu" value="${data.cpu}"  disabled="disabled" />
                      <label for="osVersion">CPU</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="faceAlgorithmVersion" value="${data.faceAlgorithmVersion}"  disabled="disabled" />
                      <label for="osVersion">Face Algorithm Version</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="channel" value="${data.channel}"  disabled="disabled" />
                      <label for="osVersion">Channel Number</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="os" value="${data.os}"  disabled="disabled" />
                      <label for="osVersion">Device OS</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="osVersion" value="${data.osVersion}"  disabled="disabled" />
                      <label for="osVersion">OS Version</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="ram" value="${data.ram}"  disabled="disabled" />
                      <label for="ram">RAM Usage</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="rom" value="${data.rom}"  disabled="disabled" />
                      <label for="rom">ROM Usage</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="wanMac" value="${data.wanMac}"  disabled="disabled" />
                      <label for="rom">MAC</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="wifiMac" value="${data.wifiMac}"  disabled="disabled" />
                      <label for="rom">Wireless MAC Address</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="manufacturer" value="${data.manufacturer}"  disabled="disabled" />
                      <label for="rom">Manufacturer</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="personCount" value="${data.personCount}"  disabled="disabled" />
                      <label for="personCount">Person Count</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input class="form-control" type="text" id="photoCount" value="${data.photoCount}"  disabled="disabled" />
                      <label for="personCount">Photo Count</label>
                    </div>
                  </div>
                </div>
          `;
      } catch (err) {
          // If failed to load additional details, show offline message
          document.getElementById('additional-details').innerHTML = `<div class="alert alert-subtle-danger" role="alert">Device is offline :(</div>`;
          console.error('Failed to load additional device details:', err);
      }
  } else {
      console.error('No device ID found in query parameters');
  }
});


