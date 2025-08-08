import Router from 'koa-router';
import { Context } from 'koa';
import { Project } from '../models/Project';
import { Coaching, ICoaching } from '../models/Coaching';
import { authMiddleware } from '../middleware/auth';

const router = new Router();
router.use(authMiddleware);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get projects based on user role
 *     description: |
 *       Returns projects filtered by user role and access permissions:
 *       - **ops**: Access to all projects
 *       - **pm**: Only projects where user is listed as manager
 *       - **client/coach**: Projects accessible through coaching relationships
 *     tags:
 *       - Projects
 *     securitySchemes:
 *       UserIdHeader:
 *         type: apiKey
 *         in: header
 *         name: x-user-id
 *     security:
 *       - UserIdHeader: []
 *     responses:
 *       200:
 *         description: List of projects based on user access level
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *             example:
 *               - _id: "507f1f77bcf86cd799439015"
 *                 managerIds: ["507f1f77bcf86cd799439011"]
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
router.get('/projects', async (ctx: Context) => {
  const user = ctx.state.user;

  switch (user.role) {
    case 'ops':
      ctx.body = await Project.find();
      break;
    case 'pm':
      ctx.body = await Project.find({ managerIds: user._id });
      break;
    case 'client': {
      const coachings = await Coaching.find({ clientId: user._id });
      const projectIds = coachings.map(
        (coachingItem: ICoaching) => coachingItem.projectId
      );

      ctx.body = await Project.find({ _id: { $in: projectIds } });
      break;
    }
    case 'coach': {
      const coachings = await Coaching.find({ coachId: user._id });
      const projectIds = coachings.map(
        (coachingItem: ICoaching) => coachingItem.projectId
      );

      ctx.body = await Project.find({ _id: { $in: projectIds } });
      break;
    }
    default:
      ctx.status = 403;
      ctx.body = { error: 'Forbidden' };
  }
});

export default router;
