const path = require('path');
const routes = require('./routes');
const { app, BrowserWindow, ipcMain, dialog, globalShortcut, ipcRenderer, contextBridge } = require('electron');
const Store = require('electron-store');
const store = new Store();
const fileHandler = require('./fileHandler');

let win;
function createWindow() {
  win = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
        //   contextIsolation: true,
      },
      maximizable: true,
  });

  win.loadFile('public/index.html');
}

app.whenReady().then(() => {
  createWindow();
  win.on('ready-to-show', () => {
    win.webContents.send('show-message', 'Hola desde el proceso principal!');
    filedata = fileHandler.getFilesInfo();
    win.webContents.send('send-library-data', filedata);
});
  
  globalShortcut.register('Alt+F1', ToolDev);
  globalShortcut.register('Alt+F2', cdevTool);
  function ToolDev() {
      win.webContents.openDevTools();
    }
    function cdevTool() {
      win.webContents.closeDevTools();
    }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/*
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});*/
// Evento emitido cuando Electron ha terminado de inicializarse
  const express = require('express');
  const { createServer } = require('http');
  const cors = require('cors');
  const mineflayer = require('mineflayer');
  const { Client, Server: ServerOsc } = require('node-osc');


  const app1 = express();


  app1.use(cors());
  app1.use(express.json());
  app1.use('/api', routes);

  /*
  mainWindow.on('focus', () => {
      mainWindow.setIgnoreMouseEvents(false);
  });

  mainWindow.on('blur', () => {
    if (devTool){
      return;
    }
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  });
  *///
  const httpServer = createServer(app1);
  let port = process.env.PORT || 8081;
  // Abre las herramientas de desarrollo de Electron (opcional)
  app1.use(express.static(path.join(__dirname, 'public')));
  httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use`);
      port++;
      httpServer.listen(port);
      console.log(` trying the next one. ${port}`);
    } else {
      console.error('Server error:', error);
    }
  });

  // Iniciar el servidor HTTP
  httpServer.listen(port);
  console.info(`Server running! Please visit http://localhost:${port}`);

  ipcMain.handle('add-file-path', async (event, fileParams) => {
    const { fileToAdd, fileName, filePath } = fileParams;
  
    try {
        if (filePath) {
            // Si se proporciona un filePath, simplemente registre su información
            const savedFilePath = fileHandler.registerFile(filePath, fileName);
            console.log(`El archivo "${fileName}" se ha registrado correctamente.`);
            return { success: true, filePath: savedFilePath };
        } else {
            // Si no se proporciona un filePath, se muestra el diálogo para guardar el archivo
            const { canceled, filePath: dialogFilePath } = await dialog.showSaveDialog({
                title: 'Guardar archivo',
                defaultPath: fileName
            });
  
            if (!canceled) {
                const savedFilePath = fileHandler.addOrReplaceFile(fileToAdd, fileName, path.dirname(dialogFilePath));
                console.log(`El archivo "${fileName}" se ha agregado o reemplazado correctamente.`);
                return { success: true, filePath: savedFilePath };
            }
        }
    } catch (err) {
        console.error('Error adding file path:', err);
        return { success: false, error: err.message };
    }
  });
  ipcMain.handle("get-files-in-folder", async () => {
    try {
        return fileHandler.getFilesInfo();
    } catch (err) {
        console.error('Error getting files:', err);
        return [];
    }
  });
  ipcMain.handle("get-file-by-id", async (event, fileId) => {
    try {
        return fileHandler.getFileById(fileId);
    } catch (err) {
        console.error('Error getting file by id:', err);
        return null;
    }
  });
  ipcMain.handle("get-file-by-name", async (event, fileIdname) => {
    try {
        return fileHandler.getFileByname(fileIdname);
    } catch (err) {
        console.error('Error getting file by name:', err);
        return null;
    }
  });
  ipcMain.handle("delete-file", async (_, fileName) => {
    try {
        fileHandler.deleteFile(fileName);
        console.log(`delete-file: ${fileName} deleted successfully.`);
        return { success: true, message: `File "${fileName}" deleted successfully.` };
    } catch (err) {
        console.error('Error deleting file:', err);
        return { success: false, message: `Error deleting file: ${err.message}` };
    }
  });
  
  ipcMain.handle("on-drag-start", async (event, fileName) => {
    try {
        const filesInfo = fileHandler.getFilesInfo();
        const fileInfo = filesInfo.find(file => file.name === fileName);
        console.log('on-drag-start', fileInfo);
        if (fileInfo) {
            const filePath = fileInfo.path;
            if (!fs.existsSync(filePath)) {
                throw new Error(`File "${filePath}" does not exist.`);
            }
        } else {
            throw new Error(`File "${fileName}" not found in filesInfo.`);
        }
    } catch (err) {
        console.error('Error starting drag:', err);
    }
  });
// main.js
let overlayWindow;

// Canal IPC para crear la ventana emergente
ipcMain.handle('create-overlay-window', () => {
    if (!overlayWindow) {
        overlayWindow = new BrowserWindow({
            // width: 800,
            // height: 600,
            fullscreen: true,  // Configura la ventana en pantalla completa
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        overlayWindow.loadFile('public/overlay.html');

        overlayWindow.on('closed', () => {
            overlayWindow = null;
        });

        overlayWindow.once('ready-to-show', () => {
            overlayWindow.webContents.send('show-message', 'Hola desde el proceso principal!');
        });
    }

    overlayWindow.setIgnoreMouseEvents(true);
    // overlayWindow.on('mousedown', (event) => {
    //     overlayWindow.setIgnoreMouseEvents(true);
    // });
    // overlayWindow.on('mouseup', (event) => {
    //     overlayWindow.setIgnoreMouseEvents(true);
    // });
    // overlayWindow.on('focus', (event) => {
    //     overlayWindow.setIgnoreMouseEvents(true);
    // });
    return { success: true };
});

// Canal IPC para enviar datos a la ventana emergente
ipcMain.handle('send-overlay-data', (_, { eventType, data }) => {
    if (overlayWindow) {
        overlayWindow.webContents.send('overlay-event', { eventType, data });
        console.log('Overlay event sent', eventType, data);
        return { success: true };
    } else {
        return { success: false, error: 'Overlay window not created yet' };
    }
});
ipcMain.handle('create-bot', (event, options) => {
  bot = mineflayer.createBot(options);
  bot.on('login', () => {
      console.log('Bot logged in');
      event.sender.send('bot-event', 'login');
  });
  bot.on('chat', (username, message) => {
      console.log(`${username}: ${message}`);
      event.sender.send('bot-event', 'chat', { username, message });
  });
  bot.on('end', () => {
      console.log('Bot disconnected');
      event.sender.send('bot-event', 'end');
  });
  // Añade más eventos y métodos según sea necesario
  return { success: true };
});

ipcMain.handle('send-chat-message', (event, message) => {
  if (bot) {
      bot.chat(message);
      return { success: true };
  }
  return { success: false, error: 'Bot not created' };
});
let oscClient2;
ipcMain.handle('create-client-osc', () => {
  const defaultClientPort = 9000;
  const defaultClientIP = '127.0.0.1';
  const oscClient = new Client(defaultClientIP, defaultClientPort);

  const server = new ServerOsc(9001, '127.0.0.1');
  server.on('listening', () => {
      console.log('OSC Server is listening.');
  });
  oscClient2 = oscClient
  // oscClient.on('listening', () => {
  //     console.log('OSC Client is listening.');
  // });

  return { success: true };
});

ipcMain.handle('send-osc-message', (event, message) => {
  if (oscClient2) {
    oscClient2.send('/chatbox/input', message, () => {
        console.log('OSC message sent:', message);
    });
    return { success: true };
}
return { success: false, error: 'OSC Client not created' };
});