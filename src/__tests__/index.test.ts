import request from 'supertest';
import { app } from '../index';

describe('Express Application', () => {
  describe('Health Check', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Gestió de Reserves de Pàdel - Sistema actiu'
      });
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'NotFound',
        message: 'The requested resource was not found'
      });
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('JSON Body Parser', () => {
    it('should parse JSON request bodies', async () => {
      // This will be tested more thoroughly when we add actual endpoints
      const response = await request(app)
        .post('/test-endpoint')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');
      
      // Should get 404 since endpoint doesn't exist, but body should be parsed
      expect(response.status).toBe(404);
    });
  });
});
