// renderer.js
document.addEventListener('DOMContentLoaded', async () => {
    const userTableBody = document.getElementById('table-latest-review-body');
    const loading = document.getElementById("loading-spinner");
    
    try {
        const users = await window.api.getUsersVisitor();
        
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle border-end border-translucent">${user.name}</td>
                <td class="align-middle border-end border-translucent">${user.email}</td>
                <td class="align-middle border-end border-translucent">${user.phone}</td>
                <td class="align-middle border-end border-translucent">${user.role_name}</td>
                <td class="align-middle text-center border-end border-translucent">
                    <img src="../uploads/${user.profile_image}" alt="${user.name}" style="width: 110px; height: 110px; object-fit: cover; border-radius: 10%;"/>
                </td>
                <td class="align-middle border-end border-translucent">${user.card_number}</td>
                <td class="align-middle border-end border-translucent">${user.created_at}</td>
                <td class="align-middle white-space-nowrap text-center">
                    <div class="btn-reveal-trigger position-static">
                        <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                        <div class="dropdown-menu dropdown-menu-end py-2">
                            <a class="dropdown-item view-user" href="#!" data-user-id="${user.id}"><i class="fa-solid fa-eye"></i> View</a>
                            <div class="dropdown-divider"></div>
                            <button type="button" id="deleteUser" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');

        loading.style.display = "none";
    } catch (err) {
        console.error('Failed to load users:', err);
    }

    document.getElementById("visitorForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const sn = document.getElementById("sn").value;
        const card = document.getElementById("card").value;
        const id_card = document.getElementById("id_card").value;
        const role = 2;
        const area = document.getElementById("device_area").value;
        const username = document.getElementById("name").value;

         // Check if image is from the camera (base64) or file upload
        const imageInput = document.getElementById("imageData");
        let image = imageInput.value;
    
        // If the user used file upload
        const fileInput = document.querySelector('.use-file input[type="file"]');
        if (fileInput && fileInput.files.length > 0) {
            // Get the file
            const file = fileInput.files[0];
            const fileReader = new FileReader();
    
            // Read the file as base64 and process it
            fileReader.onloadend = async function() {
                image = fileReader.result; // This will give base64 image data
    
                // Proceed with the form submission using the base64 data
                await submitForm(name, username, email, phone, role, image, sn, card, id_card);
            };
    
            fileReader.readAsDataURL(file); // Convert file to base64
        } else {
            // If the user used the camera, `imageInput.value` is already set to base64
            await submitForm(name, username, email, phone, role, image, sn, card, id_card);
        }
    
        })
});

//delete User
document.addEventListener('click', async (event) => {
    console.log('Click event detected:', event.target);
    if (event.target && event.target.id === 'deleteUser') {
        const row = event.target.closest('tr');
        const userId = row.querySelector('.view-user').getAttribute('data-user-id');
        
        try {
            await window.api.deleteUser(userId);
            console.log("Deleted user successfully");
            showAlert("Deleted User Successfully", "success")
            refreshTable();
            // Optionally refresh the device list or remove the row from the table
        } catch (error) {
            showAlert("Failed to delete user", "danger")
            console.error("Failed to delete user:", error);
        }
    }
});

// Helper function to submit form data
async function submitForm(name, username, email, phone, role, image, sn, card, id_card) {
    try {
        await window.api.insertUser(name, username, email, phone, role, image, sn, card, id_card);
        console.log("User created successfully.");
        showAlert("User added successfully", "success");

        const modalElement = document.getElementById('verticallyCentered');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modal.hide();
        }

        refreshTable(); // Refresh table after adding use
    } catch (err) {
        console.error('Failed to create user:', err);
    }
}

//get device area
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

async function refreshTable() {
    const userTableBody = document.getElementById('table-latest-review-body');
    
    try {
        const users = await window.api.getUsersVisitor();
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle border-end border-translucent">${user.name}</td>
                <td class="align-middle border-end border-translucent">${user.email}</td>
                <td class="align-middle border-end border-translucent">${user.phone}</td>
                <td class="align-middle border-end border-translucent">${user.role_name}</td>
                <td class="align-middle text-center border-end border-translucent">
                    <img src="../uploads/${user.profile_image}" alt="${user.name}" style="width: 110px; height: 110px; object-fit: cover; border-radius: 10%;"/>
                </td>
                <td class="align-middle border-end border-translucent">${user.card_number}</td>
                <td class="align-middle border-end border-translucent">${user.created_at}</td>
                <td class="align-middle white-space-nowrap text-center">
                    <div class="btn-reveal-trigger position-static">
                        <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                        <div class="dropdown-menu dropdown-menu-end py-2">
                            <a class="dropdown-item view-user" href="#!" data-user-id="${user.id}"><i class="fa-solid fa-eye"></i> View</a>
                            <div class="dropdown-divider"></div>
                            <button type="button" id="deleteUser" class="dropdown-item text-danger"><i class="fa-solid fa-trash"></i> Remove</button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to refresh the table:', err);
    }

    
}