document.addEventListener('DOMContentLoaded', async () => {
    const syncDiv = document.getElementById("sync-result");
    // const activeQR = document.getElementById("active-qr");

    // activeQR.focus();
    const settings = await window.api.getSettings();

    async function loginAndGetToken(email, password) {
        try {
            const response = await fetch(`${settings.value}/auth/login?email=${email}&password=${password}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const result = await response.json();
    
            if (response.ok && result.status === 201) {
               
                const token = result.data.token.split('|')[1];
                return token;
            } else {
                console.error('Login failed:', result.message);
                return null;
            }
        } catch (error) {
            console.error('Error during login:', error);
            return null;
        }
    }
    
    document.getElementById('sync-btn').addEventListener('click', async () => {
        try {
            //sync user from device to database
            syncDiv.innerHTML = `<div class="spinner-border text-primary" role="status">
                                   <span class="sr-only">Loading...</span>
                                 </div>`;
            let allUser = [];
            let indexCount = 1;
            let hasData = true;
            
            await window.api.removeOldSyncData()
            await window.api.removeUserRoleBased(2);
            // Function to fetch data from a single device
            async function deleteOldUsers(device, payload) {
                const url = `http://${device.device_ip}:8090/cgi-bin/js/person/findList`;
            
                try {
                    // Fetch the list of users
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                        },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();
            
                    if (result.code !== "000") {
                        console.error("Error fetching users:", result.msg);
                        return;
                    }
            
                    const users = result.data;
            
                    // Get the current time in milliseconds
                    const currentTime = Date.now();
                    
                    // Calculate the threshold for 3 days in milliseconds
                    const threeDaysInMillis = 2 * 24 * 60 * 60 * 1000; // 3 days
                    // const oneMinuteInMillis = 1 * 60 * 1000;
                    // Filter users that were updated more than 3 days ago
                    const oldUsers = users.filter(user => {
                        const userUpdateTime = user.updateTime; // The update time from the API response
                        console.log(userUpdateTime)
                        console.log(currentTime)
                        console.log(threeDaysInMillis)
                        return (currentTime - userUpdateTime) > threeDaysInMillis;
                    });
            
                    // If there are old users, prepare to delete them
                    if (oldUsers.length > 0) {
                        const snToDelete = oldUsers.map(user => user.sn); // Extract sn values
                        
                        // Prepare the payload
                        const payload = {
                            sn: snToDelete
                        };
            
                        const deleteUsersUrl = `http://${device.device_ip}:8090/cgi-bin/js/person/delete`;
                        // Send delete request
                        const deleteResponse = await fetch(deleteUsersUrl, {
                            method: 'POST', // Assuming the API accepts DELETE method
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                            },
                            body: JSON.stringify(payload),
                        });
            
                        const deleteResult = await deleteResponse.json();
            
                        if (deleteResponse.ok) {
                            console.log("Successfully deleted users:", deleteResult);
                        } else {
                            console.error("Error deleting users:", deleteResult);
                        }
                    } else {
                        console.log("No users to delete.");
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            }

            async function fetchDataFromDevice(device, payload) {
                const url = `http://${device.device_ip}:8090/cgi-bin/js/person/findList`;
            
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                        },
                        body: JSON.stringify(payload)
                    });
            
                    const result = await response.json();
                    return result.data;
                } catch (error) {
                    console.error(`Error fetching data from ${device.device_ip}:`, error);
                    return null;
                }
            }
            
            // Function to fetch image data using the user SN
            async function fetchImageFromDevice(device_ip, userSn, com_pass) {
                const url = `http://${device_ip}:8090/cgi-bin/js/face/find`;
            
                const payload = {
                    personSn: userSn
                };
            
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic ' + btoa('admin:' + com_pass)
                        },
                        body: JSON.stringify(payload)
                    });
            
                    const result = await response.json();
                    if (result && result.data) {
                        // Return the base64 image or empty string if no image found
                        return result.data.imgBase64 || "";
                    }
                } catch (error) {
                    console.error(`Error fetching image for userSn ${userSn} from ${device_ip}:`, error);
                    return "";
                }
                return "";
            }
            
            while (hasData) {
                // console.log(indexCount);
            
                const payload = {
                    index: indexCount,
                    length: 10
                };
            
                const alldevices = await window.api.getAllDevices();
            
                // Flag to track if any device has more data
                let dataFound = false;
            
                // Use for...of to handle asynchronous fetching properly
                for (const device of alldevices) {
                    const data = await fetchDataFromDevice(device, payload);
                    await deleteOldUsers(device, payload);
            
                    if (data && data.length > 0) {
                        // console.log(data.length);
                        // For each user, fetch their image
                        for (const user of data) {
                            // console.log(user.sn)
                            const imgBase64 = await fetchImageFromDevice(device.device_ip, user.sn, device.communication_password);
                            // Add the user and the image to the allUser array
                            allUser.push({
                                ...user, // Include the rest of the user data
                                imgBase64 // Add the image
                            });
                        }
            
                        dataFound = true; // Set flag to true if data is found
                    }
                }
            
                // If no device returned any data, stop the loop
                if (!dataFound) {
                    hasData = false;
                } else {
                    indexCount++; // Increment the index to fetch the next set of data
                }
            }
            
            // Function to check and insert user data into the database
            async function checkAndInsertUser(record) {
                try {
                    // Check if the user.type is 2 before proceeding
                    if (record.type === 2) {
                        console.log("this user type is 2 !")
                        console.log(record.cardNo)
                        // Check if the user with the same cardNo exists
                        const existingUser = await window.api.getUserByCard(record.cardNo);
                        console.log(existingUser)
                        if (!existingUser) {
                            // If no existing user, insert the new user with image
                            await window.api.insertUser(
                                record.name, 
                                "", 
                                "", 
                                "", 
                                2, // Role ID or appropriate value
                                record.imgBase64 || "", // Use the image data, or empty if none
                                record.sn, 
                                record.cardNo
                            );
                            console.log(`Inserted user: ${record.name}`);
                            // await window.api.insertSyncRecordData("fetch users", "get all visitor from device", "success", `success insert ${record.name}`)
                        } else {
                            console.log(`User with card number ${record.cardNo} already exists, skipping insertion.`);
                            await window.api.insertSyncRecordData("fetch users", "get all visitor from device", "skipped", `${record.name} already exists in the database`)
                        }
                    } else {
                        console.log(`User ${record.name} has type ${record.type}, skipping insertion.`);
                    }
                } catch (error) {
                    console.error('Error during user insertion:', error);
                    await window.api.insertSyncRecordData("fetch users", "get all visitor from device", "failed", `failed to insert ${record.name}`)
                }
            }

            async function checkAndInsertUserEmployee(record) {
                try {
                    // Check if the user.type is 2 before proceeding
                    if (record.type === 1) {
                        console.log("this user type is 1 !")
                        // Check if the user with the same cardNo exists
                        const existingUser = await window.api.getUserByCard(record.cardNo);
                        console.log(record.imgBase64)
                        if (!existingUser) {
                            // If no existing user, insert the new user with image
                            console.log("user not exists with this card number")
                            await window.api.insertUser(
                                record.name, 
                                "", 
                                "", 
                                "", 
                                1, // Role ID or appropriate value
                                record.imgBase64 || "", // Use the image data, or empty if none
                                record.sn, 
                                record.cardNo
                            );
                            console.log(`Inserted user: ${record.name}`);
                            await window.api.insertSyncRecordData("fetch users", "get all employee from device", "success", `success insert ${record.name}`)
                        } else {
                            console.log(`User with card number ${record.cardNo} already exists, skipping insertion.`);
                            await window.api.insertSyncRecordData("fetch users", "get all employee from device", "skipped", `${record.name} already exists in the database`)
                        }
                    } else {
                        console.log(`User ${record.name} has type ${record.type}, skipping insertion.`);
                    }
                } catch (error) {
                    console.error('Error during user insertion:', error);
                    await window.api.insertSyncRecordData("fetch users", "get all employee from device", "failed", `failed to insert ${record.name}`)
                }
            }
            
            //Once data is fetched, insert into the database
            allUser.forEach(async (record) => {
                await checkAndInsertUser(record);
                await checkAndInsertUserEmployee(record);
            });

            //Sync data to laravel API side
            const token = await loginAndGetToken('shasweendran@craveasia.com', '12345678');
            if (!token) {
                console.error('Failed to retrieve token.');
                return;
            }
    
            
            const users = await window.api.getUsersVisitor();

            const userData = users.map(user => {
                
                const [namePart, orderIdPart] = user.name.split(' '); // Split by space
            
                return {
                    role_id: user.role_id,
                    name: namePart,         
                    order_detail_id: orderIdPart,  
                    timestamp: user.card_number,
                    status: 0,
                    card_number: user.card_number
                };
            });

            const apiResponse = await fetch(`${settings.value}/user-registration-store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  
                },
                body: JSON.stringify({ users: userData })  
            });

            let apiResult;

            try {
                // Attempt to parse the JSON response
                apiResult = await apiResponse.json();
            } catch (error) {
                console.error('Failed to parse JSON:', error);
                syncDiv.innerHTML = 'Failed to parse server response.';
                return;
            }
            
            // Check if the response was successful (status 2xx)
            if (apiResponse.ok) {
                console.log('Sync successful', apiResult);
                for (const user of apiResult.successfulRegistrations) {
                    await window.api.insertSyncRecordData(
                        "sync users", 
                        "sync all visitors from database into server via API", 
                        "success", 
                        `Success to sync ${user.name} with order detailID ${user.order_detail_id}`
                    );
                }
                syncDiv.innerHTML = JSON.stringify(apiResult.message, null, 2);
                refreshTable();
            } else {
                // If not successful (status not in 2xx), display the error message
                console.error('Sync failed:', apiResult);
                let apiErrorMsg = JSON.stringify(apiResult.message || 'Unknown error', null, 2);
                await window.api.insertSyncRecordData("sync users", "sync all visitors from database into server via API", "failed", `failed to sync ${users.name} with order detailID ${userData.order_detail_id} due to ${apiErrorMsg}`)
                syncDiv.innerHTML = apiErrorMsg
                refreshTable();
            }

        } catch (error) {
            console.error('Error syncing data:', error);
        }
    });


    const recordTableSync = document.getElementById('table-latest-review-body-sync');
    const loading = document.getElementById("loading-spinner");

    const syncRecord = await window.api.getSyncRecord();

    if (syncRecord.length > 0) {
        recordTableSync.innerHTML = syncRecord.map(record => `
            <tr>
                <td class="white-space-nowrap fs-9 ps-0 align-middle">
                    <div class="form-check mb-0 fs-8">
                        <input class="form-check-input" type="checkbox" />
                    </div>
                </td>
                <td class="align-middle border-end border-translucent">${record.type || 'Unknown'}</td>
                <td class="align-middle border-end border-translucent">${record.details || 'N/A'}</td>
                <td class="align-middle border-end border-translucent">
                    <span class="badge badge-phoenix fs-10 ${record.status === 'success' ? 'badge-phoenix-success' : 'badge-phoenix-danger'}">
                        ${record.status || 'Unknown'}
                    </span>
                </td>
                <td class="align-middle border-end border-translucent">${record.status_details}</td>
                <td class="align-middle border-end border-translucent">${record.created_at}</td>
                <td class="align-middle white-space-nowrap text-center">
                    <div class="btn-reveal-trigger position-static">
                        <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                        <div class="dropdown-menu dropdown-menu-end py-2">
                            <button type="button" id="deleteRecord" data-record-id=${record.id} class="dropdown-item text-danger view-record"><i class="fa-solid fa-trash"></i> Remove</button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('')
    } else {
        // Provide a fallback if no users are found
        recordTableSync.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No data available</td>
            </tr>
        `;
    }

    document.addEventListener('click', async (event) => {
        console.log('Click event detected:', event.target);
        if (event.target && event.target.id === 'deleteRecord') {
            const row = event.target.closest('tr');
            const userId = row.querySelector('.view-record').getAttribute('data-record-id');
            
            try {
                await window.api.deleteSyncRecord(userId);
                console.log("Deleted record successfully");
                refreshTable();
                // Optionally refresh the device list or remove the row from the table
            } catch (error) {
                console.error("Failed to delete record:", error);
            }
        }
    });

    loading.style.display = "none";

    async function refreshTable() {
        const recordTableSync = document.getElementById('table-latest-review-body-sync');
        const loading = document.getElementById("loading-spinner");
    
        const syncRecord = await window.api.getSyncRecord();
    
        if (syncRecord.length > 0) {
            recordTableSync.innerHTML = syncRecord.map(record => `
                <tr>
                    <td class="white-space-nowrap fs-9 ps-0 align-middle">
                        <div class="form-check mb-0 fs-8">
                            <input class="form-check-input" type="checkbox" />
                        </div>
                    </td>
                    <td class="align-middle border-end border-translucent">${record.type || 'Unknown'}</td>
                    <td class="align-middle border-end border-translucent">${record.details || 'N/A'}</td>
                   <td class="align-middle border-end border-translucent">
                    <span class="badge badge-phoenix fs-10 ${record.status === 'success' ? 'badge-phoenix-success' : 'badge-phoenix-danger'}">
                        ${record.status || 'Unknown'}
                    </span>
                </td>
                    <td class="align-middle border-end border-translucent">${record.status_details}</td>
                    <td class="align-middle border-end border-translucent">${record.created_at}</td>
                    <td class="align-middle white-space-nowrap text-center">
                        <div class="btn-reveal-trigger position-static">
                            <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>
                            <div class="dropdown-menu dropdown-menu-end py-2">
                                <button type="button" id="deleteRecord" data-record-id=${record.id} class="dropdown-item text-danger view-record"><i class="fa-solid fa-trash"></i> Remove</button>
                            </div>
                        </div>
                    </td>
                </tr>
            `).join('')
        } else {
            // Provide a fallback if no users are found
            recordTableSync.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">No data available</td>
                </tr>
            `;
        }
        
        loading.style.display = "none";
        
    }

    
})