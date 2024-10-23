document.addEventListener('DOMContentLoaded', async () => {
    try {
        const visitor = await window.api.getTotalUsersVisitor();
        const totalUsersVisitor = visitor.totalUsers;

        const employee = await window.api.getTotalUsersEmployee();
        const totalUsersEmployee = employee.totalUsers;

        let totalUsers = totalUsersEmployee + totalUsersVisitor;
        // Update the total user count in the dashboard
        const userCountElement = document.querySelector('#userCount');
        userCountElement.textContent = `${totalUsers} users`;

        const devices = await window.api.getTotalDevice();
        const totalDevice = devices.totalDevices

        const deviceCountElement = document.querySelector('#deviceCount');
        deviceCountElement.textContent = `${totalDevice} devices`

        const blacklist = await window.api.getTotalUsersBlacklist();
        const totalBlacklist = blacklist.totalUsers

        const blacklistCountElement = document.querySelector('#blacklistCount');
        blacklistCountElement.textContent = `${totalBlacklist} users`

    } catch (error) {
        console.error('Error fetching user data:', error);
    }
})