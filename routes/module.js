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
                    });
                } else {
                    q.when((function (isLogin) {
                        var def = q.defer();
                        var obj = user[req.query.pid];
                        var option = {
                            url: obj.loginUrl,
                            method: 'POST',
                            form: obj.loginObj,
                            forever: true
                        };
                        if (isLogin) {
                            request(option, function (e, r, body) {
                                var cookie = r.headers['set-cookie'].join('; ');
                                def.resolve([cookie, body]);
                            });
                        } else {
                            def.resolve([]);
                        }
                        return def.promise;
                    }('true' === data.login))).then(function (result) {
                        var inObject = data.inObject ? JSON.parse(data.inObject) : {};
                        var outSchema = JSON.parse(data.outSchema || '{}');
                        var option = {
                            method: data.method.toUpperCase(),
                            url: user[req.query.pid].backendUrl + data.url,
                            forever: true
                        };
                        if ('get' === method) {
                            option.qs = inObject;
                        } else {
                            option.form = inObject;
                        }
                        request(option, function (e, r, body) {
                            if (e || 200 !== r.statusCode) {
                                res.json({
                                    code: -1,
                                    message: '服务器出错：\n' + JSON.stringify(e || body, null, 2)
                                });
                            } else {
                                try {
                                    var validate = jsen(outSchema);
                                    var check = validate(r.body);
                                    var message = '\n校验结果：\n' + (check ? '成功' : JSON.stringify(validate.errors, null, 2)) + '\n\n校验规则：\n' + JSON.stringify(data.outSchema, null, 2) + '\n\n返回值：\n' + JSON.stringify(r.body, null, 2);
                                    if (check) {
                                        res.json({
                                            code: 1,
                                            message: message
                                        });
                                    } else {
                                        res.json({
                                            code: -1,
                                            message: message
                                        });
                                    }
                                } catch (er) {
                                    console.error(er);
                                    res.status(500).send(er);
                                }
                            }
                        });
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
      var obj = req.session.user[req.query.pid] || {};
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

// request({
//     url: 'https://demo.tijianzhuanjia.com/login.json',
//     method: 'POST',
//     forever: true,
//     form: {
//         username: '13467717311',
//         password: '11111111'
//     }
// }, function(err, res, body) {
//     var cookie = res.headers['set-cookie'].join('; ');
//     request({
//         url: 'https://demo.tijianzhuanjia.com/center/selfCheck-pagination.html',
//         method: 'POST',
//         headers: {
//             'Cookie': cookie
//         },
//         form: {
//             paginationSize: 10,
//             paginationNo: 1
//         }
//     }, function(e, r, body) {
//         console.log(body);
//     });
// });
