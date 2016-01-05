/*global require,module*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var q = require('q');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var _ = require('underscore');
var http = require('http');
var querystring = require('querystring');

var cPro = db.get('projects');
var cMod = db.get('modules');
var cInt = db.get('interfaces');
var cUsr = db.get('users');

(function() {
    'use strict';
    router.post('/request.json', function(req, res) {
            var postData = '';
            if ('put' === req.body.method || 'post' === req.body.method) postData = querystring.stringify(JSON.parse(req.body.param));
            var opt = {
                method: req.body.method.toUpperCase(),
                host: conf.backEndHost,
                port: conf.backEndPort,
                path: req.body.url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            if (postData) opt.headers['Content-Length'] = postData.length;
            var request = http.request(opt, function(serverFeedback) {
                serverFeedback.on('data', function(data) {
                    res.json(JSON.parse(data.toString()));
                }).on('error', function(data) {
                    res.json(JSON.parse(data.toString()));
                });
            }).on('error', function(){
                console.log('mock server error');
            });
            if (postData) request.write(postData);
            request.end();
    })
    /*项目*/
    .get('/projects.html', function(req, res) {
        cPro.find({}, function(err, data) {
            if (err) throw err;
            else res.render('api/projects', {
                editable: req.session.user.editable,
                js: [{
                    path: '/lib/underscore/underscore-min.js'
                }, {
                    path: '/javascripts/api/projects.js'
                }]
            });
        });
    })
    .get('/project.json', function(req, res) {
        cPro.find({}, function(err, data) {
            if (err) throw err;
            else res.json(data);
        });
    })
    .post('/project.json', function(req, res) {
        cPro.insert(req.body, function(err, data) {
            if (err) throw err;
            else res.json(data);
        });
    })
    .put('/project.json/:_id', function(req, res) {
        cPro.update({
            _id: req.params._id
        }, req.body, function(err, data) {
            res.json(data);
        });
    })
    .delete('/project.json/:_id', function(req, res) {
        cPro.remove({
            _id: req.params._id
        }, function(err, data) {
            if (err) throw err;
            cMod.remove({
                pid: req.params._id
            });
            cInt.remove({
                pid: req.params._id
            }, function(err, data) {
                if (err) throw err;
                else http.get(conf.mockUrl + _.now()).on('error', function(){
                    console.log('mock server error');
                });
            });
            res.json(data);
        });
    })
    /*模块*/
    .get('/modules.html', function(req, res) {
        res.render('api/modules', {
            backEndHost: conf.backEndHost,
            backEndPort: conf.backEndPort,
            editable: req.session.user.editable,
            projectName: req.query.projectName,
            js: [{
                path: '/lib/mockjs/dist/mock-min.js'
            }, {
                path: '/lib/underscore/underscore-min.js'
            }, {
                path: '/javascripts/api/viewInterface.js'
            }, {
                path: '/javascripts/api/modules.js'
            }]
        });
    })
    .get('/modules.json/:pid', function(req, res) {
        var pId = req.params.pid;

        function gm(pId) {
            var def = q.defer();
            cMod.find({
                pid: pId
            }, function(err, data) {
                if (err) def.reject(err);
                else def.resolve(data || []);
            });
            return def.promise;
        }

        function gi(pId) {
            var def = q.defer();
            cInt.find({
                pid: pId
            }, {
                sort: {
                    mid: 1
                }
            }, function(err, data) {
                if (err) def.reject(err);
                else def.resolve(data || []);
            });
            return def.promise;
        }
        q.all([gm(pId), gi(pId)]).then(function(result) {
            var modules = result[0];
            var interfaces = result[1];
            _.each(modules, function(mod) {
                mod.interfaces = _.filter(interfaces, function(face) {
                    return face.mid === mod._id.toString();
                });
            });
            res.json(modules);
        }, function(err) {
            throw err;
        });
    })
    .post('/module.json', function(req, res) {
        cMod.insert(req.body, function(err, data) {
            if (err) throw err;
            else res.json(data);
        });
    })
    .put('/module.json/:_id', function(req, res) {
        cMod.update({
            _id: req.params._id
        }, req.body, function(err, data) {
            if (err) throw err;
            else res.json(data);
        });
    })
    .delete('/module.json/:_id', function(req, res) {
        cMod.remove({
            _id: req.params._id
        }, function(err, data) {
            if (err) {
                throw err;
            } else {
                res.json(data);
                cInt.remove({
                    mid: req.params._id
                }, function(err, data) {
                    if (err) throw err;
                    else http.get(conf.mockUrl + _.now()).on('error', function(){
                        console.log('mock server error');
                    });
                });
            }
        });
    })
    /*接口*/
    .get('/interface.html', function(req, res) {
        res.render('api/interface', {
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
                path: '/javascripts/api/rule.js'
            }, {
                path: '/javascripts/api/interface.js'
            }]
        });
    })
    .get('/interface.json/:_id', function(req, res) {
        cInt.find({
            _id: req.params._id
        }, function(err, data) {
            if (err) throw err;
            res.json(data.length > 0 ? data[0] : {});
        });
    })
    .post('/interface.json', function(req, res) {
        cInt.insert(req.body, function(err, data) {
            if (err) throw err;
            http.get(conf.mockUrl + _.now()).on('error', function(){
                console.log('mock server error');
            });
            res.json(data);
        });
    })
    .put('/interface.json/:_id', function(req, res) {
        cInt.update({
            _id: req.params._id
        }, req.body, function(err, data) {
            http.get(conf.mockUrl + _.now()).on('error', function(){
                console.log('mock server error');
            });
            res.json(data);
        });
    })
    .delete('/interface.json/:_id', function(req, res) {
        cInt.remove({
            _id: req.params._id
        }, function(err, data) {
            if (err) throw err;
            http.get(conf.mockUrl + _.now()).on('error', function(){
                console.log('mock server error');
            });
            res.json(data);
        });
    })
    /*登陆权限*/
    .get('/login.html', function(req, res) {
        if (req.query.loginout) req.session.user = null;
        res.render('api/login', {
            js: [{
                path: '/lib/angular-validation/dist/angular-validation.min.js'
            }, {
                path: '/javascripts/api/rule.js'
            }, {
                path: '/javascripts/api/login.js'
            }]
        });
    })
    .post('/login.json', function(req, res) {
        var self = this;
        cUsr.find({
            name: req.body.name,
            password: req.body.password
        }, function(err, data) {
            if (err) {
                throw err;
            } else if (data.length) {
                req.session.user = data[0];
                res.json({
                    url: '/api/projects.html'
                });
            } else {
                res.json({
                    message: '登陆失败'
                });
            }
        });
    })
    .get('/user.html', function(req, res) {
        res.render('api/user', {
            _id: req.session.user._id,
            name: req.session.user.name,
            manageable: req.session.user.manageable,
            js: [{
                path: '/javascripts/api/user.js'
            }]
        });
    })
    .get('/users.json', function(req, res) {
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
    .put('/self.json', function(req, res) {
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
    .put('/user.json/:_id', function(req, res) {
        cUsr.update({
            _id: req.params._id
        }, req.body, function(err, data) {
            if (err) throw err;
            else res.json(data);
        });
    })
    .post('/user.json', function(req, res) {
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
    .delete('/user.json/:_id', function(req, res) {
        cUsr.remove({
            _id: req.params._id
        }, function(err, data) {
            if (err) throw err;
            else res.json(data);
        });
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
    }, function(err, data) {
        if (err) {
            throw err;
        } else if (data.length === 0) {
            cUsr.insert(admin);
        }
    });
})();
module.exports = router;
