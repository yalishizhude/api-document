/*global require,module*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var _ = require('underscore');
var http = require('http');
var cInt = db.get('interfaces');
var cIntHis = db.get('interfacesHistory');
(function() {
  'use strict';
  router.get('/index.html', function(req, res) {
      res.render('interface', {
        backEndHost: conf.backEndHost,
        backEndPort: conf.backEndPort,
        title: '编辑接口',
        updateDate: (new Date()).toLocaleDateString(),
        pid: req.query.pid,
        mid: req.query.mid,
        userName: req.session.user.name,
        projectName: req.query.projectName,
        moduleName: req.query.moduleName,
        js: [{
          path: '/lib/mockjs/dist/mock-min.js'
        }, {
          path: '/lib/underscore/underscore-min.js'
        }, {
          path: '/lib/angular-validation/dist/angular-validation.min.js'
        }, {
          path: '/javascripts/rule.js'
        }, {
          path: '/javascripts/interface.js'
        }]
      });
    })
    .get('/:_id', function(req, res){
      cInt.find({_id: req.params._id}, function(e, r){
        if(e) throw e;
        res.json({api:r[0]});
      });
    })
    .get('/:oid/:version', function(req, res) {
      var result = {};
      var condition = {
        oid: req.params.oid,
        version: parseInt(req.params.version)
      };
      cInt.find(condition, function(err, data) {
        if (err) throw err;
        if (data.length > 0) {
          result.api = data[0];
          cInt.find({
            oid: data[0].oid
          }, {
            sort: {
              version: -1
            }
          }, function(err, versions) {
            if (err) throw err;
            result.versions = _.pluck(versions, 'version');
            if (data[0].referenceId) {
              cInt.find({
                _id: data[0].referenceId
              }, function(e, data) {
                if (e) throw e;
                result.api.referenceName = data[0].name;
                res.json(result);
              });
            } else {
              res.json(result);
            }
          });
        } else {
          res.json({});
        }
      });
    })
    .post('', function(req, res) {
      cInt.insert(req.body, function(err, data) {
        if (err) throw err;
        http.get(conf.mockUrl + _.now()).on('error', function() {
          console.log('mock server error');
        });
        cInt.update({
          _id: data._id
        }, {
          $set: {
            'oid': data._id.toString()
          }
        }, function(e, data) {
          if (e) throw e;
        });
        res.json(data);
      });
    })
    .put('/:_id', function(req, res) {
      var result = {};
      delete req.body._id;
      cInt.find({_id:req.params._id}, function(e, r){
        if(e) throw e;
        delete r[0]._id;
        cIntHis.insert(r[0], function(e2, r2){
          if(e2) throw e2;
          req.body.oid = r[0].oid;
          cInt.insert(req.body, function(e3, r3){
            if(e3) throw e3;
            res.json({api:r3});
          });
        });
      });
    })
    .put('/:_id/:referenceId', function(req, res) {
      cInt.update({_id: req.params._id }, {$set: {referenceId: req.params.referenceId } }, function(err, data) {
        if (err) throw err;
        http.get(conf.mockUrl + _.now()).on('error', function() {
          console.log('mock server error');
        });
        res.json(data);
      });
    })
    .put('/:_id//1', function(req, res){
      cInt.update({_id: req.params._id }, {$set: {referenceId: '',referenceName:'' } }, function(err, data) {
        if (err) throw err;
        http.get(conf.mockUrl + _.now()).on('error', function() {
          console.log('mock server error');
        });
        res.json(data);
      });
    })
    .delete('/:_id', function(req, res) {
      cInt.find({
        _id: req.params._id
      }, function(e, r) {
        if (e) throw e;
        cIntHis.insert(r[0]);
        cInt.remove({
          _id: req.params._id
        }, function(err, data) {
          if (err) throw err;
          cInt.findAndModify({
            referenceId: req.params._id
          }, {
            $set: {
              referenceId: ''
            }
          });
          res.json(data);
        });
      });
    });
})();
module.exports = router;
