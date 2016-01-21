/*global require,module*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);

var cUsr = db.get('users');
(function() {
  'use strict';
  router.get('/index.html', function(req, res) {
      res.render('user', {
        _id: req.session.user._id,
        name: req.session.user.name,
        manageable: req.session.user.manageable,
        js: [{
          path: '/javascripts/user.js'
        }]
      });
    })
    .get('', function(req, res) {
      if (req.session.user.manageable) {
        cUsr.find({
          name: {
            $ne: 'admin'
          }
        }, function(err, data) {
          if (err) throw err;
          else res.json(data);
        });
      } else {
        res.json([]);
      }
    })
    .put('/self', function(req, res) {
      cUsr.find({
        _id: req.body._id,
        password: req.body.password
      }, function(err, data) {
        if (err) {
          throw err;
        } else if (data.length) {
          cUsr.update({
            _id: req.body._id
          }, {
            password: req.body._password
          }, function(err, data) {
            if (err) throw err;
            else res.json({
              status: data,
              message: '修改成功'
            });
          });
        } else {
          res.json({
            status: 0,
            message: '密码错误，无法修改'
          });
        }
      });
    })
    .put('/:_id', function(req, res) {
      cUsr.update({
        _id: req.params._id
      }, req.body, function(err, data) {
        if (err) throw err;
        else res.json(data);
      });
    })
    .post('', function(req, res) {
      cUsr.find({
        name: req.body.name
      }, function(err, data) {
        if (err) throw err;
        else if (data.length === 0) {
          req.body.password = '111111'; //默认密码 
          cUsr.insert(req.body, function(err, data) {
            if (err) throw err;
            else res.json(data);
          });
        } else {
          res.json({
            status: 0,
            message: '用户名已被占用！'
          });
        }
      });
    })
    .delete('/:_id', function(req, res) {
      cUsr.remove({
        _id: req.params._id
      }, function(err, data) {
        if (err) throw err;
        else res.json(data);
      });
    });
})();
module.exports = router;