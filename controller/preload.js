const { contextBridge, ipcRenderer, ipcMain } = require('electron');

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
    getTotalDevice: () => ipcRenderer.invoke('get-total-devices'),

    //Insert User
    insertUser: (name, username, email, phone, role, image, sn, card) => ipcRenderer.invoke('insert-user', { name, username, email, phone, role, image, sn, card }),
    //Delete User
    deleteUser: (userId) => ipcRenderer.invoke('delete-user', userId),
    removeUserRoleBased: (roleId) => ipcRenderer.invoke('remove-users-role-based', roleId),
    removeOldUsers: () => ipcRenderer.invoke('remove-old-users'),
    //Get User by ID
    getUserById: (userId) => ipcRenderer.invoke('get-user-by-id', userId),
    //Get User by Card
    getUserByCard: (card) => ipcRenderer.invoke('get-user-by-card', card),
    //User Employee
    getUsersEmployee: () => ipcRenderer.invoke('get-users-employee'),
    getTotalUsersEmployee: () => ipcRenderer.invoke('get-total-users-employee'),
    getUsersEmployeSummary: () => ipcRenderer.invoke('get-users-employee-dashboard'),
    
    //User Visitor
    getUsersVisitor: () => ipcRenderer.invoke('get-users-visitor'),
    getTotalUsersVisitor: () => ipcRenderer.invoke('get-total-users-visitor'),
    getUsersVisitorSummary: () => ipcRenderer.invoke('get-users-visitor-dashboard'),

    //User Blacklist
    getUsersBlacklist: () => ipcRenderer.invoke('get-users-blacklist'),
    getTotalUsersBlacklist: () => ipcRenderer.invoke('get-total-users-blacklist'),

    //Get device by device area
    getDeviceByArea: (deviceId) => ipcRenderer.invoke('get-device-by-area', deviceId), 
    getAllDevices: () => ipcRenderer.invoke('get-all-devices'),

    //sync section
    getSettings: () => ipcRenderer.invoke('get-settings'),
    getAutoSync: () => ipcRenderer.invoke('get-auto-sync'),
    getApiSync: () => ipcRenderer.invoke('get-api-sync'),
    getApiUsername: () => ipcRenderer.invoke('get-api-username'),
    getApiPassword: () => ipcRenderer.invoke('get-api-password'),
    getStore: () => ipcRenderer.invoke('get-store'),
    updateSettings: (api) => ipcRenderer.invoke('update-settings', {api}),
    updateAutoSync: (autosync) => ipcRenderer.invoke('update-auto-sync', {autosync}),
    updateApiSync: (apisync) => ipcRenderer.invoke('update-api-sync', {apisync}),
    updateApiUsername: (apiusername) => ipcRenderer.invoke('update-api-username', {apiusername}),
    updateApiPassword: (apipassword) => ipcRenderer.invoke('update-api-password', {apipassword}),
    updateStore: (store) => ipcRenderer.invoke('update-store', {store}),
    insertSyncRecordData: (type, details, status, status_details) => ipcRenderer.invoke('insert-sync-record-data', {type, details, status, status_details}),
    deleteSyncRecord: (syncRecordId) => ipcRenderer.invoke('delete-sync-record', syncRecordId),
    getSyncRecord: () => ipcRenderer.invoke('get-sync-record'),
    removeOldSyncData: () => ipcRenderer.invoke('remove-sync-data-10-days-ago'),

    //User Record
    insertUserRecord: (personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl) => ipcRenderer.invoke('insert-user-record', {personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl}),
    deleteUserRecord: (userRecordId) => ipcRenderer.invoke('delete-user-record', userRecordId),
    getUserRecord: () => ipcRenderer.invoke('get-user-record'),
    getUserRecordVisitor: () => ipcRenderer.invoke('get-user-record-visitor'),
    getUserRecordEmployee: () => ipcRenderer.invoke('get-user-record-employee'),
    getUserRecordBlacklist: () => ipcRenderer.invoke('get-user-record-blacklist'),
    removeUserRecordRoleBased: (role) => ipcRenderer.invoke('remove-user-record-role-based', role),
    getUsersVisitorRecordSummary: () => ipcRenderer.invoke('get-users-visitor-record-dashboard'),
    getUsersEmployeeRecordSummary: () => ipcRenderer.invoke('get-users-employee-dashboard'),

    insertGateRecord: (personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl, deviceIp, deviceEntry, deviceStore) => ipcRenderer.invoke('insert-gate-record', {personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl, deviceIp, deviceEntry, deviceStore}),
    getGateRecordVisitor: () => ipcRenderer.invoke('get-gate-record-visitor'),
    getGateVisitorRecordSummary: () => ipcRenderer.invoke('get-gate-visitor-record-dashboard'),
    getGateEmployeeRecordSummary: () => ipcRenderer.invoke('get-gate-employee-record-dashboard'),
    //Restart App
    restartApp: () => ipcRenderer.invoke('restartApp'),

    //manual
    deleteDeviceManual: (deviceId) => ipcRenderer.invoke('delete-device-manual', deviceId),

});
