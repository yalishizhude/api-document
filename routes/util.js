var superagent = require('superagent');
var config = require('./config');
(function () {
  "use strict";
  var util = {
    rewrite: function () {
      superagent.get(config.mockUrl + (new Date()).getTime()).end(function (e, r) {
        if (e) {
          console.error(e);
        }
      });
    }
  };
  module.exports = util;
}());
