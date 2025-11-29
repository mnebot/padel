import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { AppError } from './errors';
import apiRoutes from './routes';
import swaggerSpec from './swagger';

// Create Express application
const app = express();

// Configure port
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gestió de Reserves de Pàdel - API Documentation',
}));

// Health check endpoint
/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     description: Verifica que el servidor està actiu i funcionant correctament
 *     responses:
 *       200:
 *         description: Servidor actiu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Gestió de Reserves de Pàdel - Sistema actiu
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Gestió de Reserves de Pàdel - Sistema actiu' });
});

// API Routes - Centralized route configuration
app.use('/api', apiRoutes);

// Global error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Log error for debugging
  console.error('Error:', err.name, err.message);
  
  // Handle custom application errors
  if (err instanceof AppError) {
    // Determine status code based on error type
    let statusCode = 400;
    if (err.name === 'UnauthorizedError') {
      statusCode = 401;
    } else if (err.name === 'UserNotFoundError' || err.name === 'CourtNotFoundError' || err.name === 'BookingNotFoundError') {
      statusCode = 404;
    }
    
    return res.status(statusCode).json({
      error: err.name,
      message: err.message
    });
  }
  
  // Handle generic errors (validation errors from services)
  if (err.message) {
    return res.status(400).json({
      error: err.name || 'Error',
      message: err.message
    });
  }
  
  // Handle unexpected errors
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred'
  });
});

// 404 handler for undefined routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'The requested resource was not found'
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check available at http://localhost:${PORT}/health`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

export { app };
