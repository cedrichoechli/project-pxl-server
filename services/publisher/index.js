const PubNubPublisher = require('./pubnub');

module.exports = class Publisher {
  constructor(config) {
    switch (config.pubsubType) {
      case 'pubnub':
        return new PubNubPublisher(config.pubnub);
      default:
        return null;
    }
  }
};
