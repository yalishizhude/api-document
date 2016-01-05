var app = require('../app');
var supertest = require('supertest');
var s = supertest.agent(app);

describe('404', function() {
	it('GET /', function(done){
		s.get('/')
			.expect('Location', '/api/projects.html')
			.expect(302, done);
	});
	it('redirect /api/login.html', function(done){
		s.get('/abc.html')
		.expect('Location', '/api/login.html')
		.expect(302, done);
	});
	it('POST /api/login.json', function(done) {
        s.post('/api/login.json')
            .send({'name': 'admin', 'password': 'admin'})
            .expect(200, {
                url: '/api/projects.html'
            }, done);
    });
	it('test 404', function(done){
	s.get('/'+Math.random())
		.expect(404, done);
	});
});