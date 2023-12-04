const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    navigate: (path) => ipcRenderer.send('navigate', path),
    onExcelSelected: (callback) => ipcRenderer.on('selected-excel', (event, path) => callback(path)),
    onDirectorySelected: (callback) => ipcRenderer.on('selected-directory', (event, path) => callback(path))
});

contextBridge.exposeInMainWorld('api', {
    selectExcelFile: () => ipcRenderer.invoke('select-excel-file'),
    selectImageDirectory: () => ipcRenderer.invoke('select-image-directory'),
    parseExcelFile: (excelFilePath) => ipcRenderer.invoke('parse-excel-file', excelFilePath),
    findImageForItem: (itemNumber, imagesDirectory) => ipcRenderer.invoke('find-image-for-item', itemNumber, imagesDirectory),
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    saveImage: (dataUrl, filePath) => ipcRenderer.send('save-image', dataUrl)
});
