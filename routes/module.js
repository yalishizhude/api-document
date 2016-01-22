/*global require,module*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var q = require('q');
var _ = require('underscore');
var http = require('http');

var cMod = db.get('modules');
var cInt = db.get('interfaces');
(function() {
  'use strict';
  router.get('/index.html', function(req, res) {
      res.render('module', {
        backEndHost: conf.backEndHost,
        backEndPort: conf.backEndPort,
        editable: req.session.user.editable,
        projectName: req.query.projectName,
        js: [{
          path: '/lib/mockjs/dist/mock-min.js'
        }, {
          path: '/lib/underscore/underscore-min.js'
        }, {
          path: '/javascripts/viewInterface.js'
        }, {
          path: '/javascripts/module.js'
        }]
      });
    })
    .get('/:pid', function(req, res) {
      var pId = req.params.pid;

      function gm(pId) {
        var def = q.defer();
        cMod.find({
          pid: pId
        }, {
          sort: {
            name: 1
          }
        }, function(err, data) {
          if (err) def.reject(err);
          else def.resolve(data || []);
        });
        return def.promise;
      }

      function gi(pId) {
        var def = q.defer();
        var orderby = {};
        console.log(req.query.sort);
        if ('name' === req.query.sort) {
          orderby = {
            sort: {
              mid: 1,
              name: 1
            }
          };
        } else {
          orderby = {
            sort: {
              mid: 1,
              updateDate: -1
            }
          };
        }
        cInt.find({pid: pId }, orderby, function(err, data) {
          if (err) {
            def.reject(err);
          } else {
            var map = {};
            _.each(data, function(i) {
              map[i._id.toString()] = i.name;
            });
            _.each(_.filter(data, function(it) {
              return it.referenceId;
            }), function(ref) {
              ref.referenceName = map[ref.referenceId];
            });
            def.resolve(data || []);
          }
        });
        return def.promise;
      }
      q.all([gm(pId), gi(pId)]).then(function(result) {
        var modules = result[0];
        var interfaces = result[1];
        _.each(modules, function(mod) {
          mod.interfaces = _.filter(interfaces, function(face) {
            return face.mid === mod._id.toString();
          });
        });
        res.json(modules);
      }, function(err) {
        console.error(err);
        res.status(500).send(err);
      });
    })
    .post('', function(req, res) {
      cMod.insert(req.body, function(err, data) {
        if (err){
          console.error(err);
          res.status(500).send(err);
        } else res.json(data);
      });
    })
    .put('/:_id', function(req, res) {
      cMod.update({
        _id: req.params._id
      }, req.body, function(err, data) {
        if (err){
          console.error(err);
          res.status(500).send(err);
        } else res.json(data);
      });
    })
    .delete('/:_id', function(req, res) {
      cMod.remove({
        _id: req.params._id
      }, function(err, data) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
        } else {
          res.json(data);
          cInt.remove({
            mid: req.params._id
          }, function(err, data) {
            if (err) {
              console.error(err);
              res.status(500).send(err);
            } else http.get(conf.mockUrl + _.now()).on('error', function() {
              console.log('mock server error');
            });
          });
        }
      });
    });
})();
module.exports = router;