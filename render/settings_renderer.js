document.addEventListener('DOMContentLoaded', async () => {
    
    const settings = await window.api.getSettings();

    const settingsDetails = document.getElementById('settings-details');

    if (!settingsDetails) {
        console.error('settings details container not found!');
        return;
    }

    settingsDetails.innerHTML = `
              <form id="edit-settings-details">
                  <h4 class="mb-4">Settings</h4>
                  <input type="hidden" id="device_id" value="${settings.id}" />
                  <div class="row g-3">
                      <div class="col-md-12">
                          <div class="form-floating">
                              <input class="form-control" type="text" name="api" id="api" placeholder="Device Key/SN" value="${settings.value}" />
                              <label for="add-property-wizardwizard-name">${settings.variable}</label>
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
          
        
          try {
              await window.api.updateSettings(api);
              console.log("Device area inserted successfully.");
              // Add ?success to the current URL without refreshing the page
              const newUrl = `${window.location.pathname}&success=1`;
              window.history.replaceState(null, null, newUrl);
              // Optionally refresh the table or provide feedback to the user
          } catch (err) {
              console.error('Failed to insert device area:', err);
          }
        });


})