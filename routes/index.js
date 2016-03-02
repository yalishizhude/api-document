/*global require,module*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var _ = require('underscore');
var superagent = require('superagent');
var cInt = db.get('interfaces');
var cUsr = db.get('users');
(function () {
  'use strict';
  router.get('/login.html', function (req, res) {
    if (req.query.loginout) {
      req.session.user = null;
      res.app.locals.user = null;
    }
    res.render('login', {
      js: ['/lib/angular-validation/dist/angular-validation.min.js', '/javascripts/rule.js', '/javascripts/login.js']
    });
  }).get('', function (req, res, next) {
    res.redirect('/project/index.html');
  }).post('/request', function (req, res) {
    function sendRequest(agent, data, callback) {
      data.url = data.hostport + data.url;
      switch (data.method) {
      case 'get':
        agent.get(data.url).query(data.param ? JSON.parse(data.param) : {}).end(callback);
        break;
      case 'post' || 'put':
        agent[data.method](data.url).set('Content-Type', 'application/json').send(data.param).withCredentials().end(callback);
        break;
      case 'delete':
        agent.del(data.url).end(callback);
        break;
      }
    }
    if (req.body.referenceId) {
      cInt.find({
        _id: req.body.referenceId
      }, function (e, ref) {
        if (e) {
          console.error(e);
          res.stauts(500).send(e);
        } else {
          ref[0].hostport = req.body.hostport;
          ref[0].param = ref[0].inObject;
          sendRequest(superagent, ref[0], function (e, r1) {
            if (e) {
              console.error(e);
              res.status(500).send(e);
            } else {
              req.body.param = JSON.stringify(_.extend(JSON.parse(req.body.param || '{}'), r1.body));
              if ('get' !== req.body.method) req.body.param = JSON.stringify(req.body.param);
              sendRequest(superagent, req.body, function (e, r2) {
                if (e) {
                  console.error(e);
                  res.status(500).send(e);
                }
                res.json(r2.body);
              });
            }
          });
        }
      });
    } else {
      sendRequest(superagent, req.body, function (e, r) {
        if (e) {
          console.error(e);
          res.status(500).send(e);
        } else {
          res.json(r.body);
        }
      });
    }
  });
  //创建管理员用户
  var admin = {
    name: 'admin',
    password: 'admin',
    manageable: true,
    editable: true
  };
  cUsr.find({
    name: 'admin'
  }, function (err, data) {
    if (err) {
      console.error(err);
    } else if (data.length === 0) {
      cUsr.insert(admin);
    }
  });
})();
module.exports = router;
