import express from 'express';
import { setupMiddleware } from './middleware';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { logger } from './utils/logger';
import { config } from './config';

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 4000;

// Apply middleware
setupMiddleware(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation with Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Perpetua API Documentation',
}));

// API routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api/docs`);
});

// Handle uncaught Promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise rejection:', err);
  // Don't exit process in development
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
});

export default app; 