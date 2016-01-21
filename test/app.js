/*global require,describe,it*/
var app = require('../app');
var supertest = require('supertest');
var s = supertest.agent(app);

describe('404', function() {
  'use strict';
  it('GET /', function(done) {
    s.get('/')
      .expect('Location', '/project/index.html')
      .expect(302, done);
  });
  it('redirect /login.html', function(done) {
    s.get('/abc.html')
      .expect('Location', '/login.html')
      .expect(302, done);
  });
  it('POST /login', function(done) {
    s.post('/login')
      .send({
        'name': 'admin',
        'password': 'admin'
      })
      .expect(200)
      .end(function(e, result){
        if(e) throw e;
        if(result.body.token&&result.body.url)done();
      });
  });
  it('test 404', function(done) {
    s.get('/' + Math.random())
      .expect(401, done);
  });
});
