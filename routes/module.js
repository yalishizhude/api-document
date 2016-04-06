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
var debug = require('debug')('module');
var util = require('./util');
var cMod = db.get('modules');
var cInt = db.get('interfaces');
(function () {
  'use strict';
  router.get('/index.html', function (req, res) {
    debug('*******************', req.session.user);
    res.render('module', {
      backendUrl: req.session.user[req.query.pid],
      editable: req.session.user.editable,
      js: ['/lib/jquery/dist/jquery.min.js', '/lib/bootstrap/dist/js/bootstrap.min.js', '/lib/underscore/underscore-min.js', '/javascripts/module.js']
    });
  }).get('/test/:id', function (req, res) {
    var cUsr = db.get('users');
    cUsr.findById(req.session.user._id, function (err, user) {
      if (err) {
        res.status(500).json(err);
      } else if (user[req.query.pid]) {
        cInt.findById(req.params.id, function (err, data) {
          if (err) {
            res.status(500).json({
              code: -1,
              message: '查询接口出错'
            })
          } else {
            var inObject = data.inObject ? JSON.parse(data.inObject) : {};
            superagent[data.method.toLowerCase()](user[req.query.pid] + data.url).send(inObject).end(function (e, r) {
              if (e || 200 !== r.statusCode) {
                res.json({
                  code: -1,
                  message: e||r.body
                });
              } else {
                var validate = new validator(data.schema || {});
                var check = validate.check(r.body);
                if (check._error) {
                  res.json({
                    code: -1,
                    message: JSON.stringify(check, null, 2)
                  });
                } else {
                  res.json({
                    code: 1,
                    message: r.body
                  });
                }
              }
            });
          }
        });
      } else {
        res.json({
          code: -1,
          message: '测试接口的URL不存在'
        });
      }
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

    function gp(id) {
      var def = q.defer();
      var cPro = db.get('projects');
      cPro.findById(id, function (err, data) {
        if (err) {
          console.error(err);
          def.reject(err);
        } else {
          def.resolve(data.name);
        }
      });
      return def.promise;
    }
    q.all([gm(pId), gi(pId), gp(pId)]).then(function (result) {
      var project = {
        projectName: result[2],
        modules: result[0]
      };
      var interfaces = result[1];
      _.each(project.modules, function (mod) {
        mod.interfaces = _.filter(interfaces, function (face) {
          return face.mid === mod._id.toString();
        });
      });
      res.json(project);
    }, function (err) {
      res.status(500).json(err);
    });
  }).post('', function (req, res) {
    cMod.insert(req.body, function (err, data) {
      if (err) {
        console.error(err);
        res.status(500).json(err);
      } else {
        util.rewrite();
        res.json(data);
      }
    });
  }).put('/url', function (req, res) {
    if (!req.session || !req.session.user) {
      res.status(401).json({
        code: -1,
        message: '请先登录！'
      });
    } else {
      var cUsr = db.get('users');
      var urlObj = {};
      urlObj[req.body.pid] = req.body.url;
      cUsr.update({
        _id: req.session.user._id
      }, {
        $set: urlObj
      }, function (err, data) {
        if (err) {
          res.status(500).json(err);
        } else {
          cUsr.findById(req.session.user._id, function (e, user) {
            req.session.user = user;
          });
          res.json(data);
        }
      });
    }
  }).put('/save', function (req, res){
    cInt.update({_id: req.body.id}, {$set:{
      testStatus: req.body.result
    }}, function (err, data){
      if (err) {
        res.status(500).json({
          code: -1,
          message: err
        });
      } else {
        res.json(data);
      }
    });
  }).put('/:_id', function (req, res) {
    cMod.update({
      _id: req.params._id
    }, req.body, function (err, data) {
      if (err) {
        console.error(err);
        res.status(500).json(err);
      } else {
        util.rewrite();
        res.json(data);
      }
    });
  }).delete('/:_id', function (req, res) {
    cMod.remove({
      _id: req.params._id
    }, function (err, data) {
      if (err) {
        console.error(err);
        res.status(500).json(err);
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
