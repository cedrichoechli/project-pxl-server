const fs = require('fs');
const express = require('express');

const { Publisher } = require('./services');
const CommandManager = require('./controllers/command-manager');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const { address, port, plugins } = config;

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

const publisher = new Publisher(config);
const commandManager = new CommandManager(publisher);

const app = express();

pluginServices.forEach(({ name, service }) => {
  const plugin = new service(publisher);
  if (plugin.init) {
    plugin.init();
  }

  app.get(`/${name}/:param?`, (req, res) => {
    plugin.fetch(req, res);
  });
});

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
    priority: req.param('message') || true,
  });
  res.send(`${message}`);
});

app.get('/picture/:pictureFile/:duration', (req, res) => {
  const duration = req.params.duration;
  const pictureFile = req.params.pictureFile;
  publisher.publish(`null`, {
    repeat: req.param('repeat') || false,
    name: req.param('name') || 'picture',
    duration: req.param('duration') || `${duration}`,
    pictureFile: req.param('pictureFile') || `${pictureFile}`,
    priority: req.param('message') || true,
  });
  res.send(`${pictureFile}`);
});

app.get('/animation/:pictureFile/:duration', (req, res) => {
  const duration = req.params.duration;
  const pictureFile = req.params.pictureFile;
  publisher.publish(`null`, {
    repeat: req.param('repeat') || false,
    name: req.param('name') || 'animation',
    duration: req.param('duration') || `${duration}`,
    pictureFile: req.param('pictureFile') || `${pictureFile}`,
    priority: req.param('message') || true,
  });
  res.send(`${pictureFile}`);
});

app.get('/sync/:type/:pictureFile', (req, res) => {
  const type = req.params.duration;
  const pictureFile = req.params.pictureFile;
  publisher.publish(`null`, {
    repeat: req.param('repeat') || false,
    name: req.param('name') || 'sync',
    type: req.param('type') || `${type}`,
    pictureFile: req.param('pictureFile') || `${pictureFile}`,
    priority: req.param('message') || true,
  });
  res.send(`${pictureFile}`);
});

app.get('/kill', (req, res) => {
  publisher.publish('Kill running process', {
    repeat: false,
    name: 'kill',
    duration: 1,
    priority: true,
  });
  res.send('Kill running process');
});

app.get('/clear', (req, res) => {
  commandManager.command('clear');
  res.send('Clear');
});

app.get('/stop', (req, res) => {
  commandManager.command('stop');
  res.send('Stop');
});

app.get('/start', (req, res) => {
  commandManager.command('start');
  res.send('Start');
});

app.get('/end', (req, res) => {
  commandManager.command('end');
  res.send('End');
});

const server = app.listen(port, address, () => {
  const address = server.address();
  console.log(
    'Project-pxl-server started at http://%s:%s',
    address.address,
    address.port
  );
});
