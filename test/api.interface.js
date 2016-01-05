/*global require,describe,it,before,after*/
var assert = require('assert');
var supertest = require('supertest');
var express = require('express');
var app = require('../app');
var api = require('../routes/api');
var conf = require('../routes/config');
var monk = require('monk');
var db = monk(conf.mongoUrl);
var s = supertest.agent(app);

(function(){
	'use strict';
	describe('test interfaces', function(){
		var pid = '';
		var mid = '';
		var _id = '';
		it('login', function(done) {
	        s.post('/api/login.json')
	            .send({'name': 'admin', 'password': 'admin'})
	            .expect(200, {
	                url: '/api/projects.html'
	            }, done);
	    });
	    it('init project', function(done) {
			s.post('/api/project.json')
			.send({name:'test project4interface'})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				pid = res.body._id;
				done();
			});
		});
		it('init module', function(done){
			s.post('/api/module.json')
			.send({name: 'test module4interface', pid: pid})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				mid = res.body._id;
				done();
			});
		});
		it('GET /api/interface.html', function(done){
		    s.get('/api/interface.html')
		    .expect(200, done);
		});
		it('POST /api/interface.json', function(done){
			s.post('/api/interface.json')
			.send({name:'test interface', pid: pid, mid: mid})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				_id = res.body._id;
				done();
			});
		});
		it('PUT /api/interface.json', function(done){
			s.put('/api/interface.json/'+_id)
			.send({name: 'modify interface'})
			.end(function(err, res){
				assert.equal(1, res.body); 
				done();
			});
		});
		it('GET /api/interface.json', function(done){
		    s.get('/api/interface.json/'+_id)
		    .end(function(err, res){
				assert.equal(res.body._id.length>0, true);
	    		done();
		    });
		});
		it('DELETE /api/interface.json', function(done){
			s.delete('/api/interface.json/'+_id)
			.end(function(err, res){
				assert.equal(1, res.body);
				done();
			});
		});
		it('destroy', function(done){
			s.delete('/api/project.json/'+pid)
			.end(function(err, res){
				if(err) throw err;
				done();
			});
		});
	});
})();