const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const url = require('url');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const htmlPdf = require('html-pdf');

let globalProductsList = [];


const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let win;

const createWindow = () => {
    win = new BrowserWindow({
        title: "PosterGenix",
        width: 1000,
        height: 800,
        minWidth: 1000,
        // frame: false,
        minHeight: 800,
        icon: path.join(__dirname, 'assets', 'logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    // if (isDev) {
    //     win.webContents.openDevTools();
    // }

    win.on('closed', () => {
        if (userManualWindow) {
            userManualWindow.close();
        }
        win = null;
    });

    const startUrl = url.format({
        pathname: path.join(__dirname, './renderer/index.html'),
        protocol: 'file',
    });

    win.loadFile('renderer/index.html');
}
let userManualWindow;

function createUserManualWindow() {
    // Create a new window for the user manual
    userManualWindow = new BrowserWindow({
        width: 800,
        height: 700,
        title: "User Manual",
        icon: path.join(__dirname, 'assets', 'logo.png'),
        menu: null,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    userManualWindow.setMenuBarVisibility(false);

    // Load the user manual html file
    userManualWindow.loadFile('renderer/user-manual.html');

    // Clean up the window when it is closed
    userManualWindow.on('closed', () => userManualWindow = null);
}


app.whenReady().then(() => {
    createWindow()

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

const menu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: 'Ctrl+W',
                click: () => app.quit()
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'resetzoom' },
            { role: 'close' }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'User Manual',
                click() {
                    if (!userManualWindow) {
                        createUserManualWindow();
                    } else {
                        userManualWindow.focus();
                    }
                }
            }
        ]
    }
]

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})

ipcMain.on('navigate', (event, path) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
        win.loadFile(path);
    }
});



ipcMain.handle('select-excel-file', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
    });
    if (canceled) {
        return '';
    } else {
        return filePaths[0];
    }
});

ipcMain.handle('select-image-directory', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    });
    if (canceled) {
        return '';
    } else {
        return filePaths[0];
    }
});

ipcMain.handle('parse-excel-file', async (event, excelFilePath) => {
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
});

ipcMain.handle('find-image-for-item', async (event, itemNumber, imagesDirectory) => {
    const files = fs.readdirSync(imagesDirectory);
    const imageFileName = files.find(file => file.startsWith(itemNumber) && /\.(jpg|jpeg|png|gif)$/i.test(file));
    return imageFileName ? path.join(imagesDirectory, imageFileName) : null;
});

ipcMain.on('navigate-to-listing', (event, products) => {
    console.log("Received Products in Main:", products); // Debug received data
    globalProductsList = products;
    win.loadFile(path.join(__dirname, 'renderer', 'listing.html'));

    // Delay sending the data until after the page has loaded
    setTimeout(() => {
        event.reply('send-products-list', globalProductsList);
    }, 500); // Adjust delay as needed
});

ipcMain.on('save-products-list', (event, products) => {
    globalProductsList = products;
});

ipcMain.on('get-products-list', (event) => {
    event.reply('send-products-list', globalProductsList);
});

ipcMain.on('generate-poster', (event, product) => {
    // Assuming 'win' is your BrowserWindow instance
    win.loadFile(path.join(__dirname, 'renderer', 'template.html'));

    win.webContents.once('did-finish-load', () => {
        win.webContents.send('load-product', product);
    });
});

ipcMain.on('save-image', async (event, dataUrl) => {
    const desktopPath = app.getPath('desktop');
    const date = new Date();
    const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const postersPath = path.join(desktopPath, 'posters', dateString);

    // Check if the directory exists, create it if it doesn't
    if (!fs.existsSync(postersPath)) {
        fs.mkdirSync(postersPath, { recursive: true });
    }

    // Define the path for the image file
    const timestamp = Date.now();
    const imagePath = path.join(postersPath, `poster-${timestamp}.png`);

    // Convert data URL to buffer and save the file
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, 'base64');

    fs.writeFile(imagePath, imgBuffer, err => {
        if (err) {
            console.error('Failed to save image:', err);
            return;
        }
        console.log('Image saved successfully to:', imagePath);
        // Optionally, you can send back a success message or the file path to the renderer
        event.reply('image-saved', imagePath);
    });
});


ipcMain.on('generate-bulk-posters', async (event, productsList) => {
    win.loadFile(path.join(__dirname, 'renderer', 'bulk.html'));

    // for (let i = 0; i < productsList.length; i++) {
    // const product = productsList[i];
    // Generate poster logic (this could be a separate function)
    win.webContents.once('did-finish-load', () => {
        win.webContents.send('load-page', productsList);
    });
    // Save poster logic (similar to the 'save-image' logic already implemented)
    // const desktopPath = app.getPath('desktop');
    // const date = new Date();
    // const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    // const postersPath = path.join(desktopPath, 'posters', dateString);

    // Check if the directory exists, create it if it doesn't
    // if (!fs.existsSync(postersPath)) {
    //     fs.mkdirSync(postersPath, { recursive: true });
    // }

    // Define the path for the image file
    // const timestamp = Date.now();
    // const imagePath = path.join(postersPath, `poster-${timestamp}.png`);

    // Convert data URL to buffer and save the file
    // const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    // const imgBuffer = Buffer.from(base64Data, 'base64');

    // fs.writeFile(imagePath, imgBuffer, err => {
    //     if (err) {
    //         console.error('Failed to save image:', err);
    //         return;
    //     }
    //     console.log('Image saved successfully to:', imagePath);
    // Optionally, you can send back a success message or the file path to the renderer
    //     event.reply('image-saved', imagePath);
    // });
    // After each poster is generated and saved:
    // win.webContents.send('update-progress', i + 1, productsList.length);
    // }
    // return 'completed'; // This could return a more detailed status if needed
});

