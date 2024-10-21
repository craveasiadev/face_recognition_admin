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
            
            // Function to fetch data from a single device
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
                        // Check if the user with the same cardNo exists
                        const existingUser = await window.api.getUserByCard(record.cardNo);
                        console.log(record.imgBase64)
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
                        } else {
                            console.log(`User with card number ${record.cardNo} already exists, skipping insertion.`);
                        }
                    } else {
                        console.log(`User ${record.name} has type ${record.type}, skipping insertion.`);
                    }
                } catch (error) {
                    console.error('Error during user insertion:', error);
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
                        } else {
                            console.log(`User with card number ${record.cardNo} already exists, skipping insertion.`);
                        }
                    } else {
                        console.log(`User ${record.name} has type ${record.type}, skipping insertion.`);
                    }
                } catch (error) {
                    console.error('Error during user insertion:', error);
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
           console.log(users)
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

            const apiResult = await apiResponse.json();
            if (apiResponse.ok) {
                console.log('Sync successful', apiResult);
                syncDiv.innerHTML = JSON.stringify(apiResult.message, null, 2);
            } else {
                console.error('Sync failed:', apiResult);
                syncDiv.innerHTML = JSON.stringify(apiResult.message, null, 2);
            }
        } catch (error) {
            console.error('Error syncing data:', error);
        }
    });


    
})