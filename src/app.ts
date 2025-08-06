import Koa, { Context } from 'koa';
import Router from 'koa-router';
import { koaSwagger } from 'koa2-swagger-ui';
import * as dotenv from 'dotenv';
import { swaggerSpec } from './swagger';

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
 *     description: Returns the health status of the server
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The health status of the server
 */
router.get('/', (ctx: Context) => {
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
  ctx.body = healthInfo;
});

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Hello World endpoint
 *     description: Returns a hello world message
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HelloResponse'
 */
router.get('/hello', (ctx: Context) => {
  const response: HelloResponse = { message: 'Hello World!' };
  ctx.body = response;
});

// Swagger UI route
app.use(
  koaSwagger({
    routePrefix: '/docs',
    swaggerOptions: {
      spec: swaggerSpec as Record<string, unknown>,
    },
  })
);

app.use(router.routes());
app.use(router.allowedMethods());

const PORT: number = parseInt(process.env.PORT || '3000', 10);

export const startServer = () => {
  return app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

export { app };

// Do not start server for tests
if (require.main === module) {
  startServer();
}
