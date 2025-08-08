import request from 'supertest';
import { app } from '../src/app';

describe('Hello World Endpoint', () => {
  it('should return hello world message', async () => {
    const response = await request(app.callback())
      .get('/hello')
      .expect(200);

    expect(response.body).toEqual({
      message: 'Hello World!'
    });
  });

  it('should return JSON content type', async () => {
    const response = await request(app.callback())
      .get('/hello')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
  });
});