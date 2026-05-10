const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../src/index');

const api = 'http://localhost:5000';
let authToken = '';
let userId = '';
let streamId = '';

chai.use(chaiHttp);

describe('Authentication Tests', () => {
  it('Register new user', (done) => {
    chai.request(api)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123456'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('token');
        expect(res.body).to.have.property('user');
        authToken = res.body.token;
        userId = res.body.user.id;
        done();
      });
  });

  it('Login user', (done) => {
    chai.request(api)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@123456'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });
});

describe('Streams Tests', () => {
  it('Create stream', (done) => {
    chai.request(api)
      .post('/api/streams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Stream',
        description: 'Testing the stream API'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        streamId = res.body.id;
        done();
      });
  });

  it('Get all streams', (done) => {
    chai.request(api)
      .get('/api/streams')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('Get stream by ID', (done) => {
    chai.request(api)
      .get(`/api/streams/${streamId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id', streamId);
        done();
      });
  });
});

describe('Messages Tests', () => {
  it('Send message', (done) => {
    chai.request(api)
      .post('/api/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        stream_id: streamId,
        content: 'Test message'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('content', 'Test message');
        done();
      });
  });

  it('Get stream messages', (done) => {
    chai.request(api)
      .get(`/api/messages/stream/${streamId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});

module.exports = {};
