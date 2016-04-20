/*global require,module,console*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var _ = require('underscore');
var http = require('http');
var cInt = db.get('interfaces');
var cIntHis = db.get('interfacesHistory');
var util = require('./util');
<<<<<<< HEAD
var jsen = require('jsen');
var schema = {
    "properties": {
        "pid": {
            "type": "string"
        },
        "mid": {
            "type": "string"
        },
        "version": {
            "type": "number"
        },
        "author": {
            "type": "string"
        },
        "updateDate": {
            "type": "string"
        },
        "method": {
            "type": "string",
            "enum": ["get", "put", "post", "delete"]
        },
        "name": {
            "type": "string"
        },
        "url": {
            "type": "string",
            "pattern": "^\/.*"
        },
        "inObject": {
            "type": "string"
        },
        "outObject": {
            "type": "string"
        },
        "inSchema": {
            "type": "string"
        },
        "outSchema": {
            "type": "string"
        },
        "remark": {
            "type": "string"
        },
        "oid": {
            "type": "string"
        },
        "login":{
          "type": "string"
        }
    },
    "required": ["pid", "mid", "version", "author", "updateDate", "method", "name", "url", "outObject", "login"]
};
var validate = jsen(schema, {
    greedy: true
});
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
            js: ['/lib/jquery/dist/jquery.min.js', '/lib/bootstrap/dist/js/bootstrap.min.js', '/lib/mockjs/dist/mock-min.js', '/lib/jsen/dist/jsen.min.js', '/lib/underscore/underscore-min.js', '/lib/angular-validation/dist/angular-validation.min.js', '/javascripts/rule.js', '/javascripts/interface.js']
=======
(function () {
  'use strict';
  router.get('/index.html', function (req, res) {
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
      js: ['/lib/mockjs/dist/mock-min.js', '/lib/underscore/underscore-min.js', '/lib/angular-validation/dist/angular-validation.min.js', '/javascripts/rule.js', '/javascripts/interface.js']
    });
  }).get('/:_id', function (req, res) {
    cInt.find({
      _id: req.params._id
    }, function (e, r) {
      if (e) {
        console.error(e);
        res.status(500).send(e);
      } else {
        res.json({
          api: r[0]
>>>>>>> 725a5355465833a351f0a8cc5ff2d14116ea80c2
        });
    }).get('/:_id', function(req, res) {
        cInt.find({
            _id: req.params._id
        }, function(e, r) {
            if (e) {
                console.error(e);
                res.status(500).send(e);
            } else {
                res.json({
                    editable: req.session.user.editable,
                    api: r[0]
                });
            }
        });
    }).get('/:oid/:version', function(req, res) {
        var result = {};
        var condition = {
            oid: req.params.oid,
            version: parseInt(req.params.version, 10)
        };
        cInt.find(condition, function(err, data) {
            if (err) {
                console.status(500).error(err);
            } else {
                if (data.length > 0) {
                    result.api = data[0];
                    cInt.find({
                        oid: data[0].oid
                    }, {
                        sort: {
                            version: -1
                        }
                    }, function(err, versions) {
                        if (err) {
                            console.error(err);
                            res.status(500).send(err);
                        } else {
                            result.versions = _.pluck(versions, 'version');
                            if (data[0].referenceId) {
                                cInt.find({
                                    _id: data[0].referenceId
                                }, function(e, data) {
                                    if (e) {
                                        console.error(e);
                                        res.status(500).send(e);
                                    } else {
                                        result.api.referenceName = data[0].name;
                                        res.json(result);
                                    }
                                });
                            } else {
                                res.json(result);
                            }
                        }
                    });
                } else {
                    res.json({});
                }
            }
        });
    }).post('', function(req, res) {
        if (validate(req.body)) {

            cInt.insert(req.body, function(err, data) {
                if (err) {
                    console.error(err);
                    res.status(500).send(err);
                } else {
                    util.rewrite();
                    cInt.update({
                        _id: data._id
                    }, {
                        $set: {
                            'oid': data._id.toString()
                        }
                    }, function(e, his) {
                        if (e) {
                            console.error(e);
                            res.status(500).send(e);
                        } else {
                            res.json(data);
                        }
                    });
                }
            });
        } else {
            res.json(validate.errors);
        }
    }).put('/:_id', function(req, res) {
        if (validate(req.body)) {
            delete req.body._id;
            cInt.find({
                _id: req.params._id
            }, function(e, r) {
                if (e) {
                    console.error(e);
                    res.status(500).send(e);
                } else {
                    util.rewrite();
                    delete r[0]._id;
                    cInt.remove({
                        _id: req.params._id
                    });
                    cIntHis.insert(r[0], function(e2, r2) {
                        if (e2) {
                            console.error(e2);
                            res.status(500).send(e2);
                        } else {
                            req.body.oid = r[0].oid;
                            req.body.author = req.session.user.name;
                            req.body.testStatus = 0;
                            cInt.insert(req.body, function(e3, r3) {
                                if (e3) {
                                    console.error(e3);
                                    res.status(500).send(e3);
                                } else {
                                    res.json({
                                        api: r3
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.json(validate.errors);
        }
    }).delete('/:_id', function(req, res) {
        cInt.find({
            _id: req.params._id
        }, function(e, r) {
            if (e) {
                console.error(e);
                res.status(500).send(e);
            } else {
                cIntHis.insert(r[0]);
                cInt.remove({
                    _id: req.params._id
                }, function(err, data) {
                    if (err) {
                        console.error(err);
                        res.status(500).send(err);
                    } else {
                        util.rewrite();
                        cInt.findAndModify({
                            referenceId: req.params._id
                        }, {
                            $set: {
                                referenceId: ''
                            }
                        });
                        res.json(data);
                    }
                });
            }
        });
    });
}());
module.exports = router;
