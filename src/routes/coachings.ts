import Router from 'koa-router';
import { Context } from 'koa';
import { Coaching } from '../models/Coaching';
import { Project } from '../models/Project';
import { authMiddleware } from '../middleware/auth';

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
router.get('/coachings', async (ctx: Context) => {
  const user = ctx.state.user;
  switch (user.role) {
    case 'ops':
      ctx.body = await Coaching.find();
      break;
    case 'pm': {
      const projects = await Project.find({ managerIds: user._id });
      const projectIds = projects.map((p) => p._id);
      ctx.body = await Coaching.find({ projectId: { $in: projectIds } });
      break;
    }
    case 'client':
      ctx.body = await Coaching.find({ clientId: user._id });
      break;
    case 'coach':
      ctx.body = await Coaching.find({ coachId: user._id });
      break;
    default:
      ctx.status = 403;
      ctx.body = { error: 'Forbidden' };
  }
});

export default router;
