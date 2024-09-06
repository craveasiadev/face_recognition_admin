// renderer.js
document.addEventListener('DOMContentLoaded', async () => {
    const userTableBody = document.getElementById('table-latest-review-body');
    
    try {
        const users = await window.api.getUsers();
        
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td class="fs-9 align-middle ps-0">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle">${user.id}</td>
                <td class="align-middle">${user.name}</td>
                <td class="align-middle">${user.email}</td>
                <td class="align-middle">${user.phone}</td>
                <td class="align-middle">${new Date(user.created_at * 1000).toLocaleString()}</td>
                <td class="align-middle">
                    <!-- Actions (if any) -->
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load users:', err);
    }
});
