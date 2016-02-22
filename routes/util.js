var superagent = require('superagent');
var config = require('./config.js');

module.exporst = {
  rewrite: function () {
    superagent.get(config.mockUrl + '/rewrite/' + (new Date()).getTime());
  }
};
