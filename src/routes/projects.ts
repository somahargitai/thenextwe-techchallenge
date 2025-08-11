import Router from 'koa-router';
import { Context } from 'koa';

import { authMiddleware } from '../middleware/auth';
import { AccessControl } from '../utils/accessControl';

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
 *       - **client/coach**: Access denied (403 Forbidden)
 *     tags:
 *       - Projects
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
router.get('/projects', async (context: Context) => {
  const user = context.state.user;

  const projects = await AccessControl.getAccessibleProjects(user);

  if (!['ops', 'pm'].includes(user.role)) {
    context.status = 403;
    context.body = { error: 'Forbidden' };
    return;
  }

  context.body = projects;
});

export default router;
