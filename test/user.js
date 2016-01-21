/*global require,describe,it,before,after*/
var assert = require('assert');
var supertest = require('supertest');
var express = require('express');
var app = require('../app');
var api = require('../routes/user');
var s = supertest.agent(app);
(function(){
	'use strict';
	describe('test user', function(){
		var _id = '';
	    it('login', function(done) {
	        s.post('/login')
	            .send({'name': 'admin', 'password': 'admin'})
	            .expect(200, {
	                url: '/project/index.html'
	            }, done);
	    });
		it('GET /user/index.html', function(done){
			s.get('/user/index.html')
			.expect(200, done);
		});
		it('POST /user', function(done){
			s.post('/user')
			.send({name:'test user',manageable:true,editable:true})
			.end(function(err, res){
				assert.equal(res.body._id.length>0, true);
				_id = res.body._id;
				done();
			});
		});
		it('POST /user', function(done){
			s.post('/user')
			.send({name:'test user',manageable:true,editable:true})
			.expect(200, {status:0,message:'用户名已被占用！'}, done);
		});
		it('PUT /self', function(done){
			s.put('/self')
			.send({_id:_id,password:'',_password:'222222'})
			.expect(200, {status: 0, message:'密码错误，无法修改'}, done);
		});
		it('PUT /self', function(done){
			s.put('/self')
			.send({_id:_id,password:'111111',_password:'222222'})
			.expect(200, {status: 1, message:'修改成功'}, done);
		});
		it('PUT /user', function(done){
			s.put('/user/'+_id)
			.send({name:'test user',manageable:true,editable:false})
			.end(function(err, res){
				assert(res.body, 1);
				done();
			});
		});
		it('GET /users', function(done){
			s.get('/users')
			.end(function(err, res){
				assert(Array.isArray(res.body), true);
				done();
			});
		});
		it('DELETE /user', function(done){
			s.delete('/user/'+_id)
			.end(function(err, res){
				assert(res.body, 1);
				done();
			});
		});
	});
})();