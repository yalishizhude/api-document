/*global require,module*/
(function () {
  'use strict';
  var express = require('express'),
    router = express.Router(),
    conf = require('./config'),
    monk = require('monk'),
    db = monk(conf.mongoUrl),
    cUsr = db.get('users');
  router.get('/index.html', function (req, res) {
    res.render('user', {
      _id: req.session.user._id,
      name: req.session.user.name,
      manageable: req.session.user.manageable,
      js: ['/javascripts/user.js']
    });
  }).get('', function (req, res) {
    if (req.session.user.manageable) {
      cUsr.find({
        name: {
          $ne: 'admin'
        }
      }, function (err, data) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
        } else {
          res.json(data);
        }
      });
    } else {
      res.json([]);
    }
  }).put('/self', function (req, res) {
    cUsr.find({
      _id: req.body._id,
      password: req.body.password
    }, function (err, data) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else if (data.length) {
        cUsr.update({
          _id: req.body._id
        }, {
          $set:{
            password: req.body._password             
          }
        }, function (err, data) {
          if (err) {
            console.error(err);
            res.status(500).send(err);
          } else {
            res.json({
              status: data,
              message: '修改成功'
            });
          }
        });
      } else {
        res.json({
          status: 0,
          message: '密码错误，无法修改'
        });
      }
    });
  }).put('/:_id', function (req, res) {
    cUsr.update({
      _id: req.params._id
    }, req.body, function (err, data) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(data);
      }
    });
  }).post('', function (req, res) {
    cUsr.find({
      name: req.body.name
    }, function (err, data) {
      if (err) {
        res.status(500).send(err);
      } else if (data.length === 0) {
        req.body.password = '111111'; //默认密码
        cUsr.insert(req.body, function (err, data) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(data);
          }
        });
      } else {
        res.json({
          status: 0,
          message: '用户名已被占用！'
        });
      }
    });
  })['delete']('/:_id', function (req, res) {
    cUsr.remove({
      _id: req.params._id
    }, function (err, data) {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        res.json(data);
      }
    });
  });
  module.exports = router;
}());
