/*global require,describe,it,before,after*/
var assert = require('assert');
var supertest = require('supertest');
var express = require('express');
var app = require('../app');
var api = require('../routes/api');
var s = supertest.agent(app);
(function(){
	'use strict';
	describe('test user', function(){
		var _id = '';
	    it('login', function(done) {
	        s.post('/api/login.json')
	            .send({'name': 'admin', 'password': 'admin'})
	            .expect(200, {
	                url: '/api/projects.html'
	            }, done);
	    });
		it('GET /api/user.html', function(done){
			s.get('/api/user.html')
			.expect(200, done);
		});
		it('POST /api/user.json', function(done){
			s.post('/api/user.json')
			.send({name:'test user',manageable:true,editable:true})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				_id = res.body._id;
				done();
			});
		});
		it('POST /api/user.json', function(done){
			s.post('/api/user.json')
			.send({name:'test user',manageable:true,editable:true})
			.expect(200, {status:0,message:'用户名已被占用！'}, done);
		});
		it('PUT /api/self.json', function(done){
			s.put('/api/self.json')
			.send({_id:_id,password:'',_password:'222222'})
			.expect(200, {status: 0, message:'密码错误，无法修改'}, done);
		});
		it('PUT /api/self.json', function(done){
			s.put('/api/self.json')
			.send({_id:_id,password:'111111',_password:'222222'})
			.expect(200, {status: 1, message:'修改成功'}, done);
		});
		it('PUT /api/user.json', function(done){
			s.put('/api/user.json/'+_id)
			.send({name:'test user',manageable:true,editable:false})
			.end(function(err, res){
				assert(res.body, 1);
				done();
			});
		});
		it('GET /api/users.json', function(done){
			s.get('/api/users.json')
			.end(function(err, res){
				assert(Array.isArray(res.body), true);
				done();
			});
		});
		it('DELETE /api/user.json', function(done){
			s.delete('/api/user.json/'+_id)
			.end(function(err, res){
				assert(res.body, 1);
				done();
			});
		});
	});
})();