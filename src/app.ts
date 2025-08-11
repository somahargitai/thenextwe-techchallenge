import Koa, { Context } from 'koa';
import Router from 'koa-router';
import { koaSwagger } from 'koa2-swagger-ui';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

import { swaggerSpec } from './swagger';
import projectsRouter from './routes/projects';
import coachingsRouter from './routes/coachings';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = new Koa();
const router = new Router();

interface HelloResponse {
  message: string;
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status and runtime information of the server
 *     tags:
 *       - Health
 *     security: []
 *     responses:
 *       200:
 *         description: Server health information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', (context: Context) => {
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
  context.body = healthInfo;
});

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Hello World endpoint
 *     description: Simple endpoint that returns a hello world message for testing purposes
 *     tags:
 *       - Testing
 *     security: []
 *     responses:
 *       200:
 *         description: Hello world message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HelloResponse'
 *             example:
 *               message: "Hello World!"
 */
router.get('/hello', (contet: Context) => {
  const response: HelloResponse = { message: 'Hello World!' };
  contet.body = response;
});

// Swagger Documentation
app.use(
  koaSwagger({
    routePrefix: '/docs',
    swaggerOptions: {
      spec: swaggerSpec as Record<string, unknown>,
    },
  })
);

// MongoDB Setup
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://admin:password@localhost:27017/koa_api?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('📦 MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Auth middleware for protected routes
projectsRouter.use(authMiddleware);
coachingsRouter.use(authMiddleware);

// Routers
app.use(projectsRouter.routes());
app.use(projectsRouter.allowedMethods());
app.use(coachingsRouter.routes());
app.use(coachingsRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT: number = parseInt(process.env.PORT || '3000', 10);

export const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

export { app };

// Do not start server for tests
if (require.main === module) {
  startServer();
}
