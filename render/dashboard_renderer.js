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

        // Fetch data from database
        const employeeData = await window.api.getUsersEmployeSummary();
        const visitorData = await window.api.getUsersVisitorSummary();
    
        // Prepare the data for the chart
        const employeeCounts = employeeData.map(entry => entry.count);
        const visitorCounts = visitorData.map(entry => entry.count);
        const dates = employeeData.map(entry => entry.date); // Assuming both queries return the same dates
    
        // Update the chart options with database data
        const chartOptions = {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category', // Ensure this is 'category' for date strings
                data: dates, // Use dates from the query
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Employees', // Optional, adds a label
                    type: 'line', // Ensure the type is specified (e.g., line, bar, etc.)
                    data: employeeCounts
                },
                {
                    name: 'Visitors', // Optional, adds a label
                    type: 'line', // Ensure the type is specified (e.g., line, bar, etc.)
                    data: visitorCounts
                }
            ]
        };
        
        const $totalSalesChart = document.querySelector('.echart-total-record-chart');
        if ($totalSalesChart) {
            const chart = window.echarts.init($totalSalesChart);
            chart.setOption(chartOptions);
        }
        
        

    } catch (error) {
        console.error('Error fetching user data:', error);
    }
})