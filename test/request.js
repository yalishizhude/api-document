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
	describe('test request', function(){
		it('login', function(done) {
	        s.post('/api/login.json')
	            .send({'name': 'admin', 'password': 'admin'})
	            .expect(200, {
	                url: '/api/projects.html'
	            }, done);
	    });
		it('POST /api/request.json', function(done){
			s.post('/api/request.json')
			.send({method: 'get', url: '/'})
			.end(function(err, res){
				if(err)console.log(err);
				done();
			});
		});
		it('loginout', function(done){
	    	s.get('/api/login.html?loginout=true')
	    	.expect('Content-Type', 'text/html; charset=utf-8')
	    	.expect(200, done);
	    });
	});
})();