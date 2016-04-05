/*global require,module*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var q = require('q');
var superagent = require('superagent');
var _ = require('underscore');
var validator = require('schema-validator');
var http = require('http');
var util = require('./util');
var cMod = db.get('modules');
var cInt = db.get('interfaces');
(function () {
  'use strict';
  router.get('/index.html', function (req, res) {
    res.render('module', {
      backEndHost: conf.backEndHost,
      backEndPort: conf.backEndPort,
      editable: req.session.user.editable,
      projectName: req.query.projectName,
      js: ['/lib/jquery/dist/jquery.min.js', '/lib/bootstrap/dist/js/bootstrap.min.js', '/lib/underscore/underscore-min.js', '/javascripts/viewInterface.js', '/javascripts/module.js']
    });
  }).get('/:pid', function (req, res) {
    var pId = req.params.pid;

    function gm(pId) {
      var def = q.defer();
      cMod.find({
        pid: pId
      }, {
        sort: {
          name: 1
        }
      }, function (err, data) {
        if (err) def.reject(err);
        else def.resolve(data || []);
      });
      return def.promise;
    }

    function gi(pId) {
      var def = q.defer();
      var orderby = {
        sort: {
          oid: 1
        }
      };
      if ('name' === req.query.sort) {
        orderby = {
          sort: {
            mid: 1,
            name: 1
          }
        };
      } else if ('updateDate' === req.query.sort) {
        orderby = {
          sort: {
            mid: 1,
            updateDate: -1
          }
        };
      }
      cInt.find({
        pid: pId
      }, orderby, function (err, data) {
        if (err) {
          def.reject(err);
        } else {
          var map = {};
          _.each(data, function (i) {
            map[i._id.toString()] = i.name;
          });
          _.each(_.filter(data, function (it) {
            return it.referenceId;
          }), function (ref) {
            ref.referenceName = map[ref.referenceId];
          });
          def.resolve(data || []);
        }
      });
      return def.promise;
    }
    q.all([gm(pId), gi(pId)]).then(function (result) {
      var modules = result[0];
      var interfaces = result[1];
      _.each(modules, function (mod) {
        mod.interfaces = _.filter(interfaces, function (face) {
          return face.mid === mod._id.toString();
        });
      });
      res.json(modules);
    }, function (err) {
      console.error(err);
      res.status(500).send(err);
    });
  }).get('/test/:id', function (req, res) {
    cUsr.find({
      _id: req.session.user._id
    }, function (err, user) {
      if (err) {
        res.status(500).send(err);
      } else if (user.backEndUrl) {
        cInt.find({
          _id: req.query.id
        }, function (err, data) {
          var inObject = data.inObject ? JSON.parse(data.inObject) : {};
          superagent[data.method.toLowerCase()](user.backEndUrl).send(inObject).end(function (e, r) {
            if (e) {
              res.json(e);
            } else {
              var validator = new Validator(data.schema || {});
              var check = validator.check(r.body);
              res.json(check);
            }
          });
        });
      } else {
        res.send('测试接口的URL不存在');
      }
    });
  }).post('', function (req, res) {
    cMod.insert(req.body, function (err, data) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        util.rewrite();
        res.json(data);
      }
    });
  }).put('/:_id', function (req, res) {
    cMod.update({
      _id: req.params._id
    }, req.body, function (err, data) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        util.rewrite();
        res.json(data);
      }
    });
  }).put('/url', function (req, res) {
    if (!req.session || !req.session.user) {
      res.status(401).send('请先登录！');
    } else {
      var cUsr = db.get('users');
      cUsr.update({
        _id: req.session.user._id
      }, {
        $set: {
          backEndUrl: req.body.url
        }
      }, function (err, data) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json(data);
        }
      });
    }
  }).delete('/:_id', function (req, res) {
    cMod.remove({
      _id: req.params._id
    }, function (err, data) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        util.rewrite();
        res.json(data);
        cInt.remove({
          mid: req.params._id
        });
      }
    });
  });
})();
module.exports = router;
