import Koa, { Context } from 'koa';
import Router from 'koa-router';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new Koa();
const router = new Router();

interface HelloResponse {
  message: string;
}

router.get('/', (ctx: Context) => {
  const response: HelloResponse = { message: 'Hello World!' };
  ctx.body = response;
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT: number = parseInt(process.env.PORT || '3000', 10);

export const startServer = () => {
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

export { app };

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}