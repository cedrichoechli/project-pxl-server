// Import der nötigen Bibliotheken

const fs = require('fs');
const express = require('express');

const { Publisher } = require('./services');
const CommandManager = require('./controllers/command-manager');

// Definition der nötigen Konstanten

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const { address, port, plugins } = config;

// Kontrolliert ob das jeweilige Plugin aktiviert ist und importiert es falls ja

const pluginServices = [];
Object.entries(plugins).forEach(([plugin, enabled]) => {
  if (enabled) {
    try {
      pluginServices.push({
        name: plugin,
        service: require(`./plugins/${plugin}`),
      });
    } catch ({ message }) {
      console.error(message);
    }
  }
});

// Initialisiert den Pub/Sub-Service

const publisher = new Publisher(config);
const commandManager = new CommandManager(publisher);

const app = express();

// Initialisiert Plugins

pluginServices.forEach(({ name, service }) => {
  const plugin = new service(publisher);
  if (plugin.init) {
    plugin.init();
  }

  app.get(`/${name}/:param?`, (req, res) => {
    plugin.fetch(req, res);
  });
});

// Definiert den String um denn Scrolling Text zu bedienen und die zu schickende Nachricht

app.get('/message/:message/:duration/:speed/:red/:green/:blue', (req, res) => {
  const message = req.params.message;
  const duration = req.params.duration;
  const speed = req.params.speed;
  const red = req.params.red;
  const green = req.params.green;
  const blue = req.params.blue;
  publisher.publish(`${message}`, {
    repeat: req.param('repeat') || false,
    name: req.param('name') || 'message',
    duration: req.param('duration') || `${duration}`,
    speed: req.param('speed') || `${speed}`,
    red: req.param('red') || `${red}`,
    green: req.param('green') || `${green}`,
    blue: req.param('blue') || `${blue}`,
    priority: req.param('message') || false,
  });
  res.send(`${message}`);
});

// Definiert den String um die Bildanzeige zu bedienen und die zu schickende Nachricht

app.get('/picture/:pictureFile/:duration', (req, res) => {
  const duration = req.params.duration;
  const pictureFile = req.params.pictureFile;
  publisher.publish(`null`, {
    repeat: req.param('repeat') || false,
    name: req.param('name') || 'picture',
    duration: req.param('duration') || `${duration}`,
    pictureFile: req.param('pictureFile') || `${pictureFile}`,
    priority: req.param('message') || false,
  });
  res.send(`${pictureFile}`);
});

// Definiert den String um die Animationsanzeige zu bedienen und die zu schickende Nachricht

app.get('/animation/:pictureFile/:duration', (req, res) => {
  const duration = req.params.duration;
  const pictureFile = req.params.pictureFile;
  publisher.publish(`null`, {
    repeat: req.param('repeat') || false,
    name: req.param('name') || 'animation',
    duration: req.param('duration') || `${duration}`,
    pictureFile: req.param('pictureFile') || `${pictureFile}`,
    priority: req.param('message') || false,
  });
  res.send(`${pictureFile}`);
});

// Definiert den String um die Sync-Funktion zu bedienen und die zu schickende Nachricht

app.get('/sync/:type/:pictureFile', (req, res) => {
  const type = req.params.type;
  const pictureFile = req.params.pictureFile;
  publisher.publish(`null`, {
    repeat: req.param('repeat') || false,
    name: req.param('name') || 'sync',
    type: req.param('type') || `${type}`,
    pictureFile: req.param('pictureFile') || `${pictureFile}`,
    priority: req.param('message') || false,
  });
  res.send(`${pictureFile}`);
});

// Definiert den String um die Loop-Funktion zu bedienen und die zu schickende Nachricht

app.get('/loop/:type/:duration', (req, res) => {
  const type = req.params.type;
  const duration = req.params.duration;
  publisher.publish(`null`, {
    repeat: req.param('repeat') || false,
    name: req.param('name') || 'loop',
    type: req.param('type') || `${type}`,
    duration: req.param('duration') || `${duration}`,
    priority: req.param('message') || false,
  });
  res.send(`Loop`);
});

// Definiert den String um den Queue-Clear zu bedienen und die zu schickende Nachricht

app.get('/clear', (req, res) => {
  commandManager.command('clear');
  res.send('Clear');
});

// Definiert den String um den Queue-Stop zu bedienen und die zu schickende Nachricht

app.get('/stop', (req, res) => {
  commandManager.command('stop');
  res.send('Stop');
});

// Definiert den String um den Queue-Start zu bedienen und die zu schickende Nachricht

app.get('/start', (req, res) => {
  commandManager.command('start');
  res.send('Start');
});

// Definiert den String um den Queue-End zu bedienen und die zu schickende Nachricht

app.get('/end', (req, res) => {
  commandManager.command('end');
  res.send('End');
});

// Definiert den String um den Kill-Command zu bedienen und die zu schickende Nachricht

app.get('/kill', (req, res) => {
  commandManager.command('kill');
  res.send('Kill');
});

// Started den Server

const server = app.listen(port, address, () => {
  const address = server.address();
  console.log(
    'Project-pxl-server started at http://%s:%s',
    address.address,
    address.port
  );
});
