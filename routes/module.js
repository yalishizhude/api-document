/*global require,module*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var q = require('q');
var request = require('request');
var _ = require('underscore');
var jsen = require('jsen');
var debug = require('debug')('module');
var util = require('./util');
var cMod = db.get('modules');
var cInt = db.get('interfaces');
router.get('/index.html', function (req, res) {
  res.render('module', {
    editable: req.session.user.editable,
    js: ['/lib/jquery/dist/jquery.min.js', '/lib/bootstrap/dist/js/bootstrap.min.js', '/lib/underscore/underscore-min.js', '/lib/angular-validation/dist/angular-validation.min.js', '/javascripts/rule.js', '/javascripts/module.js']
  });
}).get('/test/:id', function (req, res) {
  function testInterface(data, cookie, headers) {
    var def = q.defer();
    var inObject = data.inObject ? JSON.parse(data.inObject) : {};
    var outSchema = JSON.parse(data.outSchema || '{}');
    var option = {
      json: true,
      method: data.method.toUpperCase(),
      url: user[req.query.pid].backendUrl + data.url,
      forever: true,
      timeout: 5000
    };
    if (cookie || headers) {
      option.headers = _.extend({
        'Cookie': cookie
      }, headers);
    }
    if ('get' === data.method) {
      option.qs = inObject;
    } else {
      option.form = inObject;
    }
    var begin = _.now();
    request(option, function (e, r, body) {
      if (e || 200 !== r.statusCode) {
        def.resolve({
          code: -1,
          message: '服务器出错：\n' + JSON.stringify(e || body, null, 2),
          time: _.now() - begin
        });
      } else {
        try {
          var validate = jsen(outSchema);
          var check = validate(body);
          var message = '\n校验结果：\n' + (check ? '成功' : JSON.stringify(validate.errors, null, 2)) + '\n\n校验规则：\n' + data.outSchema + '\n\n返回值：\n' + JSON.stringify(body, null, 2);
          if (check) {
            def.resolve({
              code: 1,
              message: message,
              time: _.now() - begin
            });
          } else {
            def.resolve({
              code: -1,
              message: message,
              time: _.now() - begin
            });
          }
        } catch (er) {
          console.error(er);
          def.reject(er);
        }
      }
    });
    return def.promise;
  }

  function auth() {
    var def = q.defer();
    var obj = user[req.query.pid];
    var option = {
      url: obj.loginUrl,
      method: 'POST',
      form: obj.loginObj,
      json: true,
      forever: true,
      request: 5000
    };
    request(option, function (e, r, body) {
      if (e) {
        def.reject(e);
      } else {
        var cookie = r.headers['set-cookie'] ? r.headers['set-cookie'].join('; ') : '';
        def.resolve([cookie, body]);
      }
    });
    return def.promise;
  }
  var user = req.session.user;
  cInt.findById(req.params.id, function (err, data) {
    if (err) {
      res.status(500).json({
        code: -1,
        message: '查询接口出错'
      });
    } else {
      if ('true' === data.login) {
        q.when(auth()).then(function (result) {
          return testInterface(data, result[0], result[1]);
        }, function (error) {
          res.status(500).json(error);
        }).then(function (result) {
          res.json(result);
        }, function (error) {
          res.status(500).json(error);
        });
      } else {
        q.when(testInterface(data)).then(function (result) {
          res.json(result);
        }, function (error) {
          res.status(500).json(error);
        });
      }
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
    var obj = req.session.user[req.params.pid] || {};
    var project = {
      projectName: result[2],
      backendUrl: obj.backendUrl,
      loginUrl: obj.loginUrl,
      loginObj: obj.loginObj,
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
    urlObj[req.body.pid] = _.omit(req.body, req.body.pid);
    cUsr.update({
      _id: req.session.user._id
    }, {
      $set: urlObj
    }, function (err, data) {
      if (err) {
        res.status(500).json(err);
      } else {
        req.session.user = null;
        res.json(data);
      }
    });
  }
}).put('/save', function (req, res) {
  cInt.update({
    _id: req.body.id
  }, {
    $set: {
      testStatus: req.body.result,
      costTime: req.body.costTime,
      testUser: req.session.user.name,
      testTime: (new Date()).toLocaleDateString()
    }
  }, function (err, data) {
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
module.exports = router;
