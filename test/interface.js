/*global require,describe,it,before,after*/
var assert = require('assert');
var supertest = require('supertest');
var express = require('express');
var app = require('../app');
var ifc = require('../routes/interface');
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
	        s.post('/login')
	            .send({'name': 'admin', 'password': 'admin'})
	            .expect(200, {
	                url: '/projects.html'
	            }, done);
	    });
	    it('init project', function(done) {
			s.post('/project')
			.send({name:'test project4interface'})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				pid = res.body._id;
				done();
			});
		});
		it('init module', function(done){
			s.post('/module')
			.send({name: 'test module4interface', pid: pid})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				mid = res.body._id;
				done();
			});
		});
		it('GET /interface.html', function(done){
		    s.get('/interface.html')
		    .expect(200, done);
		});
		it('POST /interface', function(done){
			s.post('/interface')
			.send({name:'test interface', pid: pid, mid: mid})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				_id = res.body._id;
				done();
			});
		});
		it('PUT /interface', function(done){
			s.put('/interface/'+_id)
			.send({name: 'modify interface'})
			.end(function(err, res){
				assert.equal(1, res.body); 
				done();
			});
		});
		it('GET /interface', function(done){
		    s.get('/interface/'+_id)
		    .end(function(err, res){
				assert.equal(res.body._id.length>0, true);
	    		done();
		    });
		});
		it('DELETE /interface', function(done){
			s.delete('/interface/'+_id)
			.end(function(err, res){
				assert.equal(1, res.body);
				done();
			});
		});
		it('destroy', function(done){
			s.delete('/project/'+pid)
			.end(function(err, res){
				if(err) throw err;
				done();
			});
		});
	});
})();