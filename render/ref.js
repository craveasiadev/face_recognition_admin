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
async function fetchImageFromDevice(device_ip, userSn) {
    const url = `http://${device_ip}:8090/cgi-bin/js/face/find`;

    const payload = {
        personSn: userSn
    };

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
    console.log(indexCount);

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
            console.log(data.length);
            // For each user, fetch their image
            for (const user of data) {
                const imgBase64 = await fetchImageFromDevice(device.device_ip, user.sn);
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
        // Check if the user with the same cardNo exists
        const existingUser = await window.api.getUserByCard(record.cardNo);

        if (!existingUser) {
            // If no existing user, insert the new user with image
            await window.api.insertUser(
                record.name, 
                "", 
                "", 
                "", 
                2, 
                record.imgBase64 || "", // Use the image data, or empty if none
                record.sn, 
                record.cardNo
            );
            console.log(`Inserted user: ${record.name}`);
        } else {
            console.log(`User with card number ${record.cardNo} already exists, skipping insertion.`);
        }
    } catch (error) {
        console.error('Error during user insertion:', error);
    }
}

// Once data is fetched, insert into the database
allUser.forEach(async (record) => {
    await checkAndInsertUser(record);
});
