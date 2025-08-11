import Router from 'koa-router';
import { Context } from 'koa';

import { Coaching } from '../models/Coaching';
import { authMiddleware } from '../middleware/auth';
import { AccessControl } from '../utils/accessControl';

const router = new Router();
router.use(authMiddleware);

/**
 * @swagger
 * /coachings:
 *   get:
 *     summary: Get coachings based on user role
 *     description: |
 *       Returns coachings filtered by user role and access permissions:
 *       - **ops**: Access to all coaching sessions
 *       - **pm**: Coachings for projects they manage
 *       - **client**: Only coachings where they are the client
 *       - **coach**: Only coachings where they are the coach
 *     tags:
 *       - Coachings
 *     security:
 *       - UserIdHeader: []
 *     responses:
 *       200:
 *         description: List of coachings based on user access level
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coaching'
 *             example:
 *               - _id: "507f1f77bcf86cd799439020"
 *                 clientId: "507f1f77bcf86cd799439012"
 *                 coachId: "507f1f77bcf86cd799439013"
 *                 projectId: "507f1f77bcf86cd799439014"
 *                 createdAt: "2025-01-15T10:30:00.000Z"
 *                 updatedAt: "2025-01-15T10:30:00.000Z"
 *       401:
 *         description: Missing or invalid authentication header
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing X-User-Id header"
 *       403:
 *         description: Access denied for user role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 */
router.get('/coachings', async (context: Context) => {
  const user = context.state.user;

  const coachings = await AccessControl.getFilteredResources(user, {
    resourceModel: Coaching,
    clientIdField: 'clientId',
    coachIdField: 'coachId',
    projectIdField: 'projectId',
  });

  if (
    user.role === 'unknown' ||
    !['ops', 'pm', 'client', 'coach'].includes(user.role)
  ) {
    context.status = 403;
    context.body = { error: 'Forbidden' };
    return;
  }

  context.body = coachings;
});

export default router;
