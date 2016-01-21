/*global require,describe,it,before,after*/
var assert = require('assert');
var supertest = require('supertest');
var express = require('express');
var app = require('../app');
var api = require('../routes/api');
var s = supertest.agent(app);
(function(){
	'use strict';
	describe('test modules', function(){
		var pid = '';
		var _id = '';
		it('login', function(done) {
	        s.post('/api/login.json')
	            .send({'name': 'admin', 'password': 'admin'})
	            .expect(200, {
	                url: '/api/projects.html'
	            }, done);
	    });
		it('init', function(done) {
			s.post('/api/project.json')
			.send({name:'test project4module'})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				pid = res.body._id;
				done();
			});
		});
		it('GET /api/modules.html', function(done){
		    s.get('/api/modules.html')
		    .expect(200, done);
		});
		it('POST /api/module.json', function(done){
			s.post('/api/module.json')
			.send({name:'test module',pid:pid})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				_id = res.body._id;
				done();
			});
		});
		it('PUT /api/module.json', function(done){
			s.put('/api/module.json/'+_id)
			.send({name: 'modify module'})
			.end(function(err, res){
				assert.equal(1, res.body); 
				done();
			});
		});
		it('GET /api/modules.json', function(done){
		    s.get('/api/modules.json/'+pid)
		    .end(function(err, res){
				assert.equal(Array.isArray(res.body), true);
	    		done();
		    });
		});
		it('DELETE /api/module.json', function(done){
			s.delete('/api/module.json/'+_id)
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