        let allUser = []
        let indexCount = 1;
        let hasData = true;
        while (hasData) {
            const payload = {
                index: indexCount,
                length: 10
            };
            const alldevices = await window.api.getAllDevices();
            // console.log(devices);
            alldevices.map(async (device) => {
                const url = `http://${device.device_ip}:8090/cgi-bin/js/person/findList`;
    
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                    },
                    body: JSON.stringify(payload)
                });
    
                const result = await response.json();
    
                const data = result.data;
                console.log(data)

                if (data && data.length > 0) {
                    allUser = [...allUser, ...data]; // Append new data to allUser array
                    indexCount++; // Increment the index to fetch the next set of data
                } else {
                    hasData = false; // Stop fetching if no data is found
                }
                
            })
        }

        allUser.forEach(async (record) => {
            console.log(record.name); // This should now log the names
            await window.api.insertUser(record.name, "", "", "", 2, "", record.sn, record.cardNo);
        });
