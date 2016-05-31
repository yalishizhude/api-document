/*global require,console,module*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var http = require('http');
var util = require('./util');
var q = require('q');
router.get('*', function (req, res) {
  var collection = db.get('api');
  collection.find({}, function(e,r){
    if(e) {
      res.render('500');
    } else {
      res.render('api', {
        editable: req.session.user ? req.session.user.editable : false,
        js: []
      });
    }
  });
});
module.exports = router;
