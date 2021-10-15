const fs = require('fs');
const request = require('request');

const configFile = fs.readFileSync(`${__dirname}/config.json`);
const config = JSON.parse(configFile);

module.exports = class Weather {
  constructor(publisher) {
    this._publisher = publisher;

    const { city, unit, apiKey } = config;
    this._unit = unit;
    this._weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
  }

  init() {
  }

  fetch(req, res) {
    request(this._weatherUrl, (err, response, body) => {
      if (err) {
        throw new Error('Weather Error', err);
      }

      const result = JSON.parse(body);
      if (result.main === undefined){
        throw new Error('Weather: failed to get weather data, please try again.');
      }

      const TEMP_UNITS = {
        'default': 'K',
        'metric': 'C',
        'imperial': 'F'
      };
      const unit = TEMP_UNITS[this._unit];
      const temperature = `Jetzt: ${Math.round(result.main.temp)}'${unit}. Heute ${Math.round(result.main.temp_min)}'${unit} bis ${Math.round(result.main.temp_max)}'${unit}.`;
      const condition = `Vorhersage: ${result.weather[0].description}. Luftfeuchtigkeit: ${result.main.humidity}%.`;
      const message = `${result.name} - ${temperature} ${condition}`;

      console.log('Weather', message);
      this._publisher.publish(message, {
        'repeat': false,
        'name': 'weather',
        'duration': 35,
        'priority': false
      });
    });

    res.send('Weather fetched');
  }
};
