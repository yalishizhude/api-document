/*global require*/
var express = require('express');
var router = express.Router();
var conf = require('./config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var http = require('http');
var util = require('./util.js');

var cPro = db.get('projects');
var cMod = db.get('modules');
var cInt = db.get('interfaces');
(function() {
	'use strict';
	router.get('/index.html', function(req, res) {
			cPro.find({}, function(err, data) {
				if (err) {
					console.error(err);
					res.status(500).send(err);
				} else res.render('project', {
					editable: req.session.user.editable,
					js: [{
						path: '/lib/underscore/underscore-min.js'
					}, {
						path: '/javascripts/project.js'
					}]
				});
			});
		})
		.get('', function(req, res) {
			cPro.find({}, function(err, data) {
				if (err) {
					console.error(err);
					res.status(500).send(err);
				} else res.json(data);
			});
		})
		.post('', function(req, res) {
			cPro.insert(req.body, function(err, data) {
				if (err) {
					console.error(err);
					res.status(500).send(err);
				} else {
					util.rewrite();
					res.json(data);
				}
			});
		})
		.put('/:_id', function(req, res) {
			cPro.update({
				_id: req.params._id
			}, req.body, function(err, data) {
				if (err) {
					console.error(err);
					res.status(500).send(err);
				} else {
					res.json(data);
					util.rewrite();
				}
			});
		})
		.delete('/:_id', function(req, res) {
			cPro.remove({
				_id: req.params._id
			}, function(err, data) {
				if (err) {
					console.error(err);
					res.status(500).send(err);
				} else {
					cMod.remove({
						pid: req.params._id
					});
					cInt.remove({
						pid: req.params._id
					});
					util.rewrite();
					res.json(data);
				}
			});
		});
})();
module.exports = router;
