import { Context, Next } from 'koa';
import mongoose from 'mongoose';

import User from '../models/User';

export const authMiddleware = async (ctx: Context, next: Next) => {
  const userId = ctx.headers['x-user-id'] as string;

  if (!userId) {
    console.log('❌ Auth Debug - Missing X-User-Id header');
    ctx.status = 401;
    ctx.body = { error: 'Missing X-User-Id header' };
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log('❌ Auth Debug - Invalid ObjectId format');
    ctx.status = 401;
    ctx.body = { error: 'Invalid user ID format' };
    return;
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log('❌ Auth Debug - User not found in database');
      ctx.status = 401;
      ctx.body = { error: 'Invalid user ID' };
      return;
    }

    ctx.state.user = user;
    await next();
  } catch (error) {
    console.error('❌ Auth Debug - Database error:', error);
    ctx.status = 401;
    ctx.body = {
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : String(error),
    };
  }
};
