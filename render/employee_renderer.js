// renderer.js
document.addEventListener('DOMContentLoaded', async () => {
    const userTableBody = document.getElementById('table-latest-review-body');
    const loading = document.getElementById("loading-spinner");
    
    try {
        const users = await window.api.getUsersEmployee();
        
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle">${user.name}</td>
                <td class="align-middle">${user.email}</td>
                <td class="align-middle">${user.phone}</td>
                <td class="align-middle">${user.role_name}</td>
                <td class="align-middle">image</td>
                <td class="align-middle">${user.card_number}</td>
                <td class="align-middle">${new Date(user.created_at * 1000).toLocaleString()}</td>
                <td class="align-middle">
                    <!-- Actions (if any) -->
                </td>
            </tr>
        `).join('');

        loading.style.display = "none";
    } catch (err) {
        console.error('Failed to load users:', err);
    }

    document.getElementById("employeeForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const image = document.getElementById("imageData").value;
        const sn = document.getElementById("sn").value;
        const card = document.getElementById("card").value;
        const id_card = document.getElementById("id_card").value;
        const role = 1;
        const area = document.getElementById("device_area").value;

        try {
            await window.api.insertUser(name, email, phone, role, image, sn, card, id_card);
            console.log("User Created successfully.");
            showAlert("Added Device Successfully", "success")
            const modalElement = document.getElementById('verticallyCentered');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide();
            }
            refreshTable();
            // Optionally refresh the table or provide feedback to the user
        } catch (err) {
            console.error('Failed to create user:', err);
        }

    })
});

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
        const users = await window.api.getUsersEmployee();
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle">${user.name}</td>
                <td class="align-middle">${user.email}</td>
                <td class="align-middle">${user.phone}</td>
                <td class="align-middle">${user.role_name}</td>
                <td class="align-middle">image</td>
                <td class="align-middle">${user.card_number}</td>
                <td class="align-middle">${new Date(user.created_at * 1000).toLocaleString()}</td>
                <td class="align-middle">
                    <!-- Actions (if any) -->
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to refresh the table:', err);
    }

    
}