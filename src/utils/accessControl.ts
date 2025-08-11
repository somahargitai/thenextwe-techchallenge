import { Types } from 'mongoose';
import { IUser } from '../models/User';
import { Project } from '../models/Project';
import { Coaching } from '../models/Coaching';

export interface AccessControlOptions {
  resourceModel: any;
  clientIdField?: string;
  coachIdField?: string;
  projectIdField?: string;
}

/**
 * Reusable Access Control Utility
 *
 * Scalable class for role and project-based access control
 * for any resource (coachings, coaching calls, module results, etc.)
 *
 * - ops: Access to all resources
 * - pm: Access to resources for projects they manage
 * - client: Access to resources where they are the client
 * - coach: Access to resources where they are the coach
 * - unknown roles: No access
 */
export class AccessControl {
  /**
   * Access control function for resources
   *
   * @param user - The authenticated user
   * @param options - Configuration for the resource type
   * @returns Filtered resources based on user's access level
   */
  static async getFilteredResources(
    user: IUser,
    options: AccessControlOptions
  ): Promise<any[]> {
    const {
      resourceModel,
      clientIdField = 'clientId',
      coachIdField = 'coachId',
      projectIdField = 'projectId',
    } = options;

    switch (user.role) {
      case 'ops':
        return await resourceModel.find();

      case 'pm':
        const managedProjects = await Project.find({ managerIds: user._id });
        const managedProjectIds = managedProjects.map((p: any) => p._id);
        return await resourceModel.find({
          [projectIdField]: { $in: managedProjectIds },
        });

      case 'client':
        return await resourceModel.find({ [clientIdField]: user._id });

      case 'coach':
        return await resourceModel.find({ [coachIdField]: user._id });

      default:
        return [];
    }
  }

  /**
   * Check if a user has access to a specific resource
   *
   * @param user - The authenticated user
   * @param resourceId - The ID of the resource to check access for
   * @param options - Configuration for the resource type
   * @returns True if user has access, false otherwise
   */
  static async hasResourceAccess(
    user: IUser,
    resourceId: Types.ObjectId,
    options: AccessControlOptions
  ): Promise<boolean> {
    const {
      resourceModel,
      clientIdField = 'clientId',
      coachIdField = 'coachId',
      projectIdField = 'projectId',
    } = options;

    const resource = await resourceModel.findById(resourceId);
    if (!resource) return false;

    switch (user.role) {
      case 'ops':
        return true;

      case 'pm':
        const managedProjects = await Project.find({ managerIds: user._id });
        const managedProjectIds = managedProjects.map((p: any) => p._id);
        return managedProjectIds.some(
          (projectId: any) =>
            projectId.toString() === resource[projectIdField].toString()
        );

      case 'client':
        return resource[clientIdField].equals(user._id);

      case 'coach':
        return resource[coachIdField].equals(user._id);

      default:
        return false;
    }
  }

  /**
   * Get projects accessible to a user based on their role
   *
   * @param user - The authenticated user
   * @returns Projects the user has access to
   */
  static async getAccessibleProjects(user: IUser): Promise<any[]> {
    switch (user.role) {
      case 'ops':
        return await Project.find();

      case 'pm':
        return await Project.find({ managerIds: user._id });

      case 'client':
      case 'coach':
        const coachings = await Coaching.find({
          [user.role === 'client' ? 'clientId' : 'coachId']: user._id,
        });
        const projectIds = coachings.map((c: any) => c.projectId);
        return await Project.find({ _id: { $in: projectIds } });

      default:
        return [];
    }
  }
}
