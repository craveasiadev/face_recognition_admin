const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    
    //DeviceArea
    getDeviceArea: () =>ipcRenderer.invoke('get-device-areas'),
    insertDeviceArea: (areaName, sort) => ipcRenderer.invoke('insert-device-area', { areaName, sort }), // Pass parameters here
    deleteDeviceArea: (deviceAreaId) => ipcRenderer.invoke('delete-device-area', deviceAreaId),

    //Device
    getDevice: () =>ipcRenderer.invoke('get-device'),
    getdevicebyid: (deviceId) => ipcRenderer.invoke('get-device-by-id', deviceId),
    insertDevice: (device_ip, device_key, device_name, device_area, password, device_entry) => ipcRenderer.invoke('insert-device', { device_ip, device_key, device_name, device_area, password, device_entry }), // Pass parameters here
    deleteDevice: (deviceId) => ipcRenderer.invoke('delete-device', deviceId),
    updateDevice: (device_id, device_ip, device_key, device_name, device_area, device_entry) => ipcRenderer.invoke('update-device', { device_id, device_ip, device_key, device_name, device_area, device_entry }),
    updatePass: (deviceId, newPass) => ipcRenderer.invoke('update-device-pass', { deviceId, newPass }),

    //Insert User
    insertUser: (name, email, phone, role, image, sn, card, id_card) => ipcRenderer.invoke('insert-user', { name, email, phone, role, image, sn, card, id_card }),
    
    //User Employee
    getUsersEmployee: () => ipcRenderer.invoke('get-users-employee'),
    

    //User Visitor
    getUsersVisitor: () => ipcRenderer.invoke('get-users-visitor'),

    //User Blacklist
    getUsersBlacklist: () => ipcRenderer.invoke('get-users-blacklist'),
});
