const path = require('path');
const routes = require('./routes');
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

  const client = new Client('127.0.0.1', 9000);
  const server2 = new ServerOsc(9001, '127.0.0.1');
  server2.on('listening', () => {
    console.log('OSC Server is listening.');
  });
  const app1 = express();

  let bot;
  let botStatus = false;
  let disconnect = false;
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
  const port = process.env.PORT || 8082;
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

  // Evento emitido cuando   la ventana se cierra

  

  // Iniciar el servidor HTTP
  httpServer.listen(port);
  console.info(`Server running! Please visit http://localhost:${port}`);

