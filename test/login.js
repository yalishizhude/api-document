/*global require,describe,it,before,after*/
var assert = require('assert');
var supertest = require('supertest');
var express = require('express');
var app = require('../app');
var api = require('../routes/api');
var s = supertest.agent(app);
(function(){
	'use strict';
	describe('test login', function() {
	    it('POST /api/login.json', function(done) {
	        s.post('/api/login.json')
	            .send({'name': 'admin', 'password': 'admin'})
	            .expect(200, {
	                url: '/api/projects.html'
	            }, done);
	    });
	    it('POST /api/login.json', function(done) {
	        s.post('/api/login.json')
	        	.send({'name': 'admin', 'password': ''})
	            .expect(200, {
	                message: '登陆失败'
	            }, done);
	    });
	    it('GET /api/login.html', function(done){
	    	s.get('/api/login.html?loginout=true')
	    	.expect('Content-Type', 'text/html; charset=utf-8')
	    	.expect(200, done);
	    });
	});
})();