/*global require,describe,it,before,after*/
var assert = require('assert');
var supertest = require('supertest');
var express = require('express');
var app = require('../app');
var api = require('../routes/api');
var s = supertest.agent(app);
(function(){
	'use strict';
	describe('test projects', function(){
		var _id = '';
	    it('login', function(done) {
	        s.post('/api/login.json')
	            .send({'name': 'admin', 'password': 'admin'})
	            .expect(200, {
	                url: '/api/projects.html'
	            }, done);
	    });
		it('GET /api/projects.html', function(done){
		    s.get('/api/projects.html')
		    .expect(200, done);
		});
		it('GET /api/project.json', function(done){
		    s.get('/api/project.json')
		    .end(function(err, res){
				assert.equal(Array.isArray(res.body), true);
	    		done();
		    });
		});
		it('POST /api/project.json', function(done){
			s.post('/api/project.json')
			.send({name:'test project'})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				_id = res.body._id;
				done();
			});
		});
		it('PUT /api/project.json', function(done){
			s.put('/api/project.json/'+_id)
			.send({name: 'modify project'})
			.end(function(err, res){
				assert.equal(1, res.body); 
				done();
			});
		});
		it('DELETE /api/project.json', function(done){
			s.delete('/api/project.json/'+_id)
			.end(function(err, res){
				assert.equal(1, res.body);
				done();
			});
		});
	});
})();