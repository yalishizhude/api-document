/*global require*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var http = require('http');

var cPro = db.get('projects');
var cMod = db.get('modules');
var cInt = db.get('interfaces');
(function() {
  'use strict';
  router.get('/index.html', function(req, res) {
      cPro.find({}, function(err, data) {
        if (err) throw err;
        else res.render('project', {
          editable: req.session.user.editable,
          js: [{
            path: '/lib/underscore/underscore-min.js'
          }, {
            path: '/javascripts/project.js'
          }]
        });
      });
    })
    .get('', function(req, res) {
      cPro.find({}, function(err, data) {
        if (err) throw err;
        else res.json(data);
      });
    })
    .post('', function(req, res) {
      cPro.insert(req.body, function(err, data) {
        if (err) throw err;
        else res.json(data);
      });
    })
    .put('/:_id', function(req, res) {
      cPro.update({
        _id: req.params._id
      }, req.body, function(err, data) {
        res.json(data);
      });
    })
    .delete('/:_id', function(req, res) {
      cPro.remove({
        _id: req.params._id
      }, function(err, data) {
        if (err) throw err;
        cMod.remove({
          pid: req.params._id
        });
        cInt.remove({
          pid: req.params._id
        }, function(err, data) {
          if (err) throw err;
          else http.get(conf.mockUrl + (new Date().getTime())).on('error', function() {
            console.log('mock server error');
          });
        });
        res.json(data);
      });
    });
})();
module.exports = router;