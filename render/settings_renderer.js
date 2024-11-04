document.addEventListener('DOMContentLoaded', async () => {
    
    const settings = await window.api.getSettings();
    const autoSync = await window.api.getAutoSync();
    const apiSync = await window.api.getApiSync();
    const apiUsername = await window.api.getApiUsername();
    const apiPassword = await window.api.getApiPassword();

    const settingsDetails = document.getElementById('settings-details');

    if (!settingsDetails) {
        console.error('settings details container not found!');
        return;
    }

    settingsDetails.innerHTML = `
              <form id="edit-settings-details">
                  <h4 class="mb-4">Settings</h4>
                  <input type="hidden" id="device_id" value="${settings.id}" />
                  <div class="row g-3 mb-2">
                      <div class="col-md-12">
                          <div class="form-floating">
                              <input class="form-control" type="text" name="api" id="api" placeholder="Device Key/SN" value="${settings.value}" />
                              <label for="add-property-wizardwizard-name">${settings.variable}</label>
                          </div>
                      </div>
                  </div>
                  <div class="row g-3 mb-2">
                      <div class="col-md-12">
                          <div class="form-floating">
                            <select class="form-select" name="autosync" id="autosync">
                              <option value="off" ${autoSync.value === "1" ? "selected" : ""}>Off</option>
                              <option value="3" ${autoSync.value === "3" ? "selected" : ""}>3 minutes</option>
                              <option value="6" ${autoSync.value === "6" ? "selected" : ""}>6 minutes</option>
                              <option value="9" ${autoSync.value === "9" ? "selected" : ""}>9 minutes</option>
                              <option value="15" ${autoSync.value === "15" ? "selected" : ""}>15 minutes</option>
                              <option value="30" ${autoSync.value === "30" ? "selected" : ""}>30 minutes</option>
                              <option value="60" ${autoSync.value === "60" ? "selected" : ""}>1 hour</option>
                            </select>
                            <label for="autosync">${autoSync.variable}</label>
                          </div>
                          
                      </div>
                  </div>
                  <div class="row g-3 mb-2">
                      <div class="col-md-12">
                          <div class="form-floating">
                            <select class="form-select" name="API Sync" id="apisync">
                              <option value="allow" ${autoSync.value === "allow" ? "selected" : ""}>Allow</option>
                              <option value="off" ${apiSync.value === "off" ? "selected" : ""}>Off</option>
                            </select>
                            <label for="apisync">${apiSync.variable}</label>
                          </div>
                          
                      </div>
                  </div>
                  <div class="row g-3 mb-2">
                      <div class="col-md-12">
                          <div class="form-floating">
                              <input class="form-control" type="text" name="apiUsername" id="apiUsername" placeholder="Device Key/SN" value="${apiUsername.value}" />
                              <label for="add-property-wizardwizard-name">${apiUsername.variable}</label>
                          </div>
                      </div>
                  </div>
                  <div class="row g-3 mb-2">
                      <div class="col-md-12">
                          <div class="form-floating">
                              <input class="form-control" type="text" name="apiPassword" id="apiPassword" placeholder="Device Key/SN" value="${apiPassword.value}" />
                              <label for="add-property-wizardwizard-name">${apiPassword.variable}</label>
                          </div>
                      </div>
                  </div>
                  <button class="btn btn-primary mt-5 w-100" type="submit">Save</button>
                  <button id="refreshButton" type="button" class="btn btn-sm btn-outline-info w-100 mt-3"><i class="fa-solid fa-arrows-rotate"></i> Refresh</button>
                  
              </form>
          `;

          document.getElementById('refreshButton').addEventListener('click', () => {
            // Refresh the page
            window.location.href = `settings.html`;
        });

        //edit details function
        document.getElementById("edit-settings-details").addEventListener('submit', async (event) => {
          event.preventDefault();
          const api = document.getElementById("api").value;
          const autosync = document.getElementById('autosync').value
          const apisync = document.getElementById('apisync').value
          const apiUsername = document.getElementById('apiUsername').value
          const apiPassword = document.getElementById('apiPassword').value
          console.log(autoSync)
          try {
              await window.api.updateSettings(api);
              await window.api.updateAutoSync(autosync);
              await window.api.updateApiSync(apisync);
              await window.api.updateApiUsername(apiUsername);
              await window.api.updateAapiPassword(apiPassword);
              console.log("settings updated successfully.");

              // Add ?success to the current URL without refreshing the page
              const newUrl = `${window.location.pathname}&success=1`;
              window.history.replaceState(null, null, newUrl);
              const restartModal = new bootstrap.Modal(document.getElementById('restart'), {
                  keyboard: false
              });
              restartModal.show(); 
              // Optionally refresh the table or provide feedback to the user
          } catch (err) {
              console.error('Failed to update settings:', err);
          }
        });

        document.getElementById("restartAppButton").addEventListener('click', () => {
            window.api.restartApp(); // Call to restart the Electron app
        });

})