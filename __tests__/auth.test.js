const supertest = require('supertest');
const mong = require('mongoose');
const app = require('../server');
const tokenModel = require('../model/token.model');
const userModel = require('../model/user.model');

const server = supertest.agent(app);

// Option mongo
const optMongo = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
  autoIndex: false,
};

// it data
const user = {
  'name': 'Nikolay',
  'id': 'example@example.com',
  'password': '123qwerty321',
};

let token = null;

describe('it the root auth path', () => {
  beforeAll(async (done) => {
    await mong.connect(process.env.DB, optMongo);
    done();
  });

  afterAll(async (done) => {
    await mong.connection.dropDatabase(); // Только для тестовой базы данных!!!
    await mong.connection.close();
    done();
  });

  it('It should response the POST method (signup) ', async (done) => {
    const resp = await server.post('/auth/signup').send(user);

    expect(resp.statusCode).toBe(201);
    expect(typeof resp.body).toBe('object');
    expect(resp.body).toHaveProperty('token');
    expect(typeof resp.body.token).toBe('string');

    done();
  });

  it('It should response the POST method (signup) duplicate id error', async (done) => {
    const resp = await server.post('/auth/signup').send(user);

    expect(resp.statusCode).toBe(400);
    expect(typeof resp.body).toBe('object');
    expect(resp.body).toHaveProperty('message');
    expect(typeof resp.body.message).toBe('string');

    done();
  });

  it('It should response the POST method (signin) correct user', async (done) => {
    const resp = await server.post('/auth/signin').send({
      'id': 'example@example.com',
      'password': '123qwerty321',
    });

    expect(resp.statusCode).toBe(200);
    expect(typeof resp.body).toBe('object');
    expect(resp.body).toHaveProperty('token');
    expect(typeof resp.body.token).toBe('string');

    token = resp.body.token;
    done();
  });

  it('It should response the POST method (signin) not found user', async (done) => {
    const resp = await server.post('/auth/signin').send({
      'id': 'example@example123.com',
      'password': '123qwerty321',
    });

    expect(resp.statusCode).toBe(400);
    expect(typeof resp.body).toBe('object');
    expect(resp.body).toHaveProperty('message');
    expect(typeof resp.body.message).toBe('string');
    expect(resp.body.message).toBe('User not found!');

    done();
  });

  it('It should response the POST method (signin) incorrect password', async (done) => {
    const resp = await server.post('/auth/signin').send({
      'id': 'example@example.com',
      'password': '123qwerty32',
    });

    expect(resp.statusCode).toBe(400);
    expect(typeof resp.body).toBe('object');
    expect(resp.body).toHaveProperty('message');
    expect(typeof resp.body.message).toBe('string');
    expect(resp.body.message).toBe('Incorrect password!');

    done();
  });

  it('It should response the GET method (info)', async (done) => {
    const resp = await server.get('/auth/info').set('Authorization', `Bearer ${token}`);

    expect(resp.statusCode).toBe(200);
    expect(typeof resp.body).toBe('object');
    expect(resp.body).toHaveProperty('id');
    expect(resp.body).toHaveProperty('type');
    expect(typeof resp.body.id).toBe('string');
    expect(typeof resp.body.type).toBe('string');
    expect(resp.body.type).toBe('email');

    done();
  });

  // it('It should response the GET method (latency)', async (done) => {
  //   const resp = await server.get('/auth/latency').set('Authorization', `Bearer ${token}`);

  //   expect(resp.statusCode).toBe(200);
  //   expect(typeof resp.body).toBe('string');

  //   done();
  // });

  it('It should response the GET method (logout) query false', async (done) => {
    const resp = await server.get('/auth/logout?all=false').set('Authorization', `Bearer ${token}`);

    expect(resp.statusCode).toBe(204);

    // Check the data in the database
    const tkn = await tokenModel.findOne({ token });
    expect(tkn).toBeFalsy();

    done();
  });

  it('It should response the GET method (logout) query true', async (done) => {
    const data = await server.post('/auth/signin').send({
      'id': 'example@example.com',
      'password': '123qwerty321',
    });

    const resp = await server.get('/auth/logout?all=true').set('Authorization', `Bearer ${data.body.token}`);

    expect(resp.statusCode).toBe(204);

    // Check the data in the database
    const userData = await userModel.findOne({ userId: user.id }).lean();
    const tkn = await tokenModel.find({ userId: userData._id });

    expect(tkn.length).toBeFalsy();

    done();
  });
});
