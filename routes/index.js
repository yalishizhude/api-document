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
  //更新老接口
  if (process.argv.indexOf('--update') > -1) {
    cInt.find({
      $or: [{
        inParams: {
          $not: {
            $in: [null, []]
          }
        }
      }, {
        outParams: {
          $not: {
            $in: [null, []]
          }
        }
      }, {
        url: {
          $regex: /\?/
        }
      }]
    }, function (err, ifc) {
      if (err) throw err;
      if (ifc.length > 0) {
        var interfaceList = [];
        var hdjk = process.argv.indexOf('--hdjk') > -1;
        cInt.find({}, function (e, rr) {
          rr.forEach(function (r) {
            //将url不允许查询参数，如/s/d?_BIZCODE=006。url查询参数转为inObject
            r.url = r.url || '';
            if (r.url.indexOf('?') > -1) {
              var search = r.url.split('?')[1];
              var inObject = r.inObject ? JSON.parse(r.inObject) : {};
              r.url = r.url.split('?')[0];
              search.split('&').forEach(function (pair) {
                inObject[pair.split('=')[0]] = pair.split('=')[1];
              });
              r.inObject = JSON.stringify(inObject, null, 2);
            }
            //将inParams/outParams参数说明转为inSchema/outSchema，考虑到嵌套参数描述，不加规则校验
            r.inParams = r.inParams || [];
            r.outParams = r.outParams || [];
            r.inSchema = r.inSchema || {"properties":{}};
            r.outSchema = r.outSchema || {"properties":{}};
            r.inObject = r.inObject || '';
            if (r.inParams.length > 0 || r.outParams.length > 0) {
              r.inParams.forEach(function (param) {
                r.inSchema.properties[param.name] = {
                  type: param.type.toLowerCase(),
                  description: param.desc
                };
              });
              if (hdjk && r.inObject.indexOf('_BIZCODE')>-1) {
                r.inSchema.required = ['_BIZCODE'];
              }
              r.outParams.forEach(function (param) {
                r.outSchema[param.name] = {
                  description: param.desc
                };
              });
            }
            r.inSchema = JSON.stringify(r.inSchema, null, 2);
            r.outSchema = JSON.stringify(r.outSchema, null, 2);
            delete r.inParams;
            delete r.outParams;
            delete r._id;
            interfaceList.push(r);
          });
          cInt.drop();
          var len = 0;
          interfaceList.forEach(function (i) {
            cInt.insert(i, function (err, data) {
              if (err) throw err;
              else len++;
            });
          });
          console.log('已更新接口：',len);
        });
      }
    });
  }
})();
module.exports = router;
