import { Context, Next } from 'koa';
import mongoose from 'mongoose';

import User from '../models/User';

export const authMiddleware = async (context: Context, next: Next) => {
  const userId = context.headers['x-user-id'] as string;

  if (!userId) {
    console.log('❌ Auth Debug - Missing X-User-Id header');
    context.status = 401;
    context.body = { error: 'Missing X-User-Id header' };
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log('❌ Auth Debug - Invalid ObjectId format');
    context.status = 401;
    context.body = { error: 'Invalid user ID format' };
    return;
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log('❌ Auth Debug - User not found in database');
      context.status = 401;
      context.body = { error: 'Invalid user ID' };
      return;
    }

    context.state.user = user;
    await next();
  } catch (error) {
    console.error('❌ Auth Debug - Database error:', error);
    context.status = 401;
    context.body = {
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : String(error),
    };
  }
};
