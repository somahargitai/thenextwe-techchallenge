import mongoose from 'mongoose';

import { AccessControl } from '../src/utils/accessControl';
import User, { IUser } from '../src/models/User';
import { Coaching } from '../src/models/Coaching';
import { createUser, createProject, createCoaching } from './factories';

const createMockResourceModel = (resources: any[]) => ({
  find: jest.fn().mockResolvedValue(resources),
  findById: jest.fn().mockImplementation((id) => {
    const resource = resources.find((r) => r._id.toString() === id.toString());
    return resource || null;
  }),
});

describe('AccessControl Utility', () => {
  let opsUser: IUser;
  let pmUser: IUser;
  let clientUser: IUser;
  let coachUser: IUser;
  let unknownUser: IUser;

  beforeEach(async () => {
    opsUser = await createUser({ role: 'ops' } as any);
    pmUser = await createUser({ role: 'pm' } as any);
    clientUser = await createUser({ role: 'client' } as any);
    coachUser = await createUser({ role: 'coach' } as any);

    unknownUser = await User.create({
      firstName: 'Unknown',
      lastName: 'Role',
      role: 'ops' as any,
    });
    await User.updateOne({ _id: unknownUser._id }, {
      $set: { role: 'unknown' },
    } as any);
    unknownUser = (await User.findById(unknownUser._id)) as IUser;
  });

  describe('getFilteredResources', () => {
    it('returns all resources for ops users', async () => {
      const mockResources = [
        {
          _id: '1',
          clientId: 'client1',
          coachId: 'coach1',
          projectId: 'project1',
        },
        {
          _id: '2',
          clientId: 'client2',
          coachId: 'coach2',
          projectId: 'project2',
        },
      ];
      const mockModel = createMockResourceModel(mockResources);

      const result = await AccessControl.getFilteredResources(opsUser, {
        resourceModel: mockModel,
      });

      expect(result).toEqual(mockResources);
      expect(mockModel.find).toHaveBeenCalledWith();
    });

    it('returns resources for projects managed by pm users', async () => {
      const project = await createProject({ managerIds: [pmUser._id] });
      const mockResources = [
        {
          _id: '1',
          clientId: 'client1',
          coachId: 'coach1',
          projectId: project._id,
        },
      ];
      const mockModel = createMockResourceModel(mockResources);

      const result = await AccessControl.getFilteredResources(pmUser, {
        resourceModel: mockModel,
        projectIdField: 'projectId',
      });

      expect(result).toEqual(mockResources);
      expect(mockModel.find).toHaveBeenCalledWith({
        projectId: { $in: [project._id] },
      });
    });

    it('returns resources where client is the client', async () => {
      const mockResources = [
        {
          _id: '1',
          clientId: clientUser._id,
          coachId: 'coach1',
          projectId: 'project1',
        },
        {
          _id: '2',
          clientId: 'client2',
          coachId: 'coach2',
          projectId: 'project2',
        },
      ];
      const mockModel = createMockResourceModel(mockResources);

      const result = await AccessControl.getFilteredResources(clientUser, {
        resourceModel: mockModel,
        clientIdField: 'clientId',
      });

      expect(result).toEqual(mockResources);
      expect(mockModel.find).toHaveBeenCalledWith({ clientId: clientUser._id });
    });

    it('returns resources where coach is the coach', async () => {
      const mockResources = [
        {
          _id: '1',
          clientId: 'client1',
          coachId: coachUser._id,
          projectId: 'project1',
        },
        {
          _id: '2',
          clientId: 'client2',
          coachId: 'coach2',
          projectId: 'project2',
        },
      ];
      const mockModel = createMockResourceModel(mockResources);

      const result = await AccessControl.getFilteredResources(coachUser, {
        resourceModel: mockModel,
        coachIdField: 'coachId',
      });

      expect(result).toEqual(mockResources);
      expect(mockModel.find).toHaveBeenCalledWith({ coachId: coachUser._id });
    });

    it('returns empty array for unknown roles', async () => {
      const mockModel = createMockResourceModel([]);

      const result = await AccessControl.getFilteredResources(unknownUser, {
        resourceModel: mockModel,
      });

      expect(result).toEqual([]);
      expect(mockModel.find).not.toHaveBeenCalled();
    });

    it('handles custom field mappings', async () => {
      const mockResources = [
        {
          _id: '1',
          participantId: clientUser._id,
          facilitatorId: 'coach1',
          moduleId: 'module1',
        },
      ];
      const mockModel = createMockResourceModel(mockResources);

      const result = await AccessControl.getFilteredResources(clientUser, {
        resourceModel: mockModel,
        clientIdField: 'participantId',
        coachIdField: 'facilitatorId',
        projectIdField: 'moduleId',
      });

      expect(result).toEqual(mockResources);
      expect(mockModel.find).toHaveBeenCalledWith({
        participantId: clientUser._id,
      });
    });
  });

  describe('hasResourceAccess', () => {
    it('returns true for ops users accessing any resource', async () => {
      const mockResource = {
        _id: '000000000000000000000001',
        clientId: 'client1',
        coachId: 'coach1',
        projectId: 'project1',
      };
      const mockModel = createMockResourceModel([mockResource]);

      const result = await AccessControl.hasResourceAccess(
        opsUser,
        new mongoose.Types.ObjectId('000000000000000000000001'),
        { resourceModel: mockModel }
      );

      expect(result).toBe(true);
    });

    it('returns true for pm users accessing resources in managed projects', async () => {
      const project = await createProject({ managerIds: [pmUser._id] });
      const mockResource = {
        _id: '000000000000000000000001',
        clientId: 'client1',
        coachId: 'coach1',
        projectId: project._id,
      };
      const mockModel = createMockResourceModel([mockResource]);

      const result = await AccessControl.hasResourceAccess(
        pmUser,
        new mongoose.Types.ObjectId('000000000000000000000001'),
        { resourceModel: mockModel, projectIdField: 'projectId' }
      );

      expect(result).toBe(true);
    });

    it('returns false for pm users accessing resources in unmanaged projects', async () => {
      const otherProject = await createProject({
        managerIds: [new mongoose.Types.ObjectId()],
      });
      const mockResource = {
        _id: '000000000000000000000001',
        clientId: 'client1',
        coachId: 'coach1',
        projectId: otherProject._id,
      };
      const mockModel = createMockResourceModel([mockResource]);

      const result = await AccessControl.hasResourceAccess(
        pmUser,
        new mongoose.Types.ObjectId('000000000000000000000001'),
        { resourceModel: mockModel, projectIdField: 'projectId' }
      );

      expect(result).toBe(false);
    });

    it('returns true for client users accessing their own resources', async () => {
      const mockResource = {
        _id: '000000000000000000000001',
        clientId: clientUser._id,
        coachId: 'coach1',
        projectId: 'project1',
      };
      const mockModel = createMockResourceModel([mockResource]);

      const result = await AccessControl.hasResourceAccess(
        clientUser,
        new mongoose.Types.ObjectId('000000000000000000000001'),
        { resourceModel: mockModel, clientIdField: 'clientId' }
      );

      expect(result).toBe(true);
    });

    it('returns false for client users accessing others resources', async () => {
      const mockResource = {
        _id: '000000000000000000000001',
        clientId: new mongoose.Types.ObjectId(),
        coachId: 'coach1',
        projectId: 'project1',
      };
      const mockModel = createMockResourceModel([mockResource]);

      const result = await AccessControl.hasResourceAccess(
        clientUser,
        new mongoose.Types.ObjectId('000000000000000000000001'),
        { resourceModel: mockModel, clientIdField: 'clientId' }
      );

      expect(result).toBe(false);
    });

    it('returns true for coach users accessing their own resources', async () => {
      const mockResource = {
        _id: '000000000000000000000001',
        clientId: 'client1',
        coachId: coachUser._id,
        projectId: 'project1',
      };
      const mockModel = createMockResourceModel([mockResource]);

      const result = await AccessControl.hasResourceAccess(
        coachUser,
        new mongoose.Types.ObjectId('000000000000000000000001'),
        { resourceModel: mockModel, coachIdField: 'coachId' }
      );

      expect(result).toBe(true);
    });

    it('returns false for unknown roles', async () => {
      const mockResource = {
        _id: '000000000000000000000001',
        clientId: 'client1',
        coachId: 'coach1',
        projectId: 'project1',
      };
      const mockModel = createMockResourceModel([mockResource]);

      const result = await AccessControl.hasResourceAccess(
        unknownUser,
        new mongoose.Types.ObjectId('000000000000000000000001'),
        { resourceModel: mockModel }
      );

      expect(result).toBe(false);
    });

    it('returns false for non-existent resources', async () => {
      const mockModel = createMockResourceModel([]);

      const result = await AccessControl.hasResourceAccess(
        opsUser,
        new mongoose.Types.ObjectId(),
        { resourceModel: mockModel }
      );

      expect(result).toBe(false);
    });
  });

  describe('getAccessibleProjects', () => {
    it('returns all projects for ops users', async () => {
      const project1 = await createProject();
      const project2 = await createProject();

      const result = await AccessControl.getAccessibleProjects(opsUser);

      const projectIds = result.map((p: any) => p._id.toString());
      expect(projectIds).toEqual(
        expect.arrayContaining([
          project1._id.toString(),
          project2._id.toString(),
        ])
      );
      expect(result.length).toBe(2);
    });

    it('returns only managed projects for pm users', async () => {
      const managedProject = await createProject({ managerIds: [pmUser._id] });
      await createProject({ managerIds: [new mongoose.Types.ObjectId()] });

      const result = await AccessControl.getAccessibleProjects(pmUser);

      expect(result.length).toBe(1);
      expect(result[0]._id.toString()).toBe(managedProject._id.toString());
    });

    it('returns projects through coaching for client users', async () => {
      const project1 = await createProject();
      const project2 = await createProject();
      const coach = await createUser({ role: 'coach' } as any);

      await Coaching.create({
        clientId: clientUser._id,
        coachId: coach._id,
        projectId: project1._id,
      });
      await Coaching.create({
        clientId: clientUser._id,
        coachId: coach._id,
        projectId: project2._id,
      });

      const result = await AccessControl.getAccessibleProjects(clientUser);

      const projectIds = result.map((p: any) => p._id.toString());
      expect(projectIds).toEqual(
        expect.arrayContaining([
          project1._id.toString(),
          project2._id.toString(),
        ])
      );
      expect(result.length).toBe(2);
    });

    it('returns projects through coaching for coach users', async () => {
      const project = await createProject();
      const client = await createUser({ role: 'client' } as any);

      await Coaching.create({
        clientId: client._id,
        coachId: coachUser._id,
        projectId: project._id,
      });

      const result = await AccessControl.getAccessibleProjects(coachUser);

      expect(result.length).toBe(1);
      expect(result[0]._id.toString()).toBe(project._id.toString());
    });

    it('returns empty array for unknown roles', async () => {
      const result = await AccessControl.getAccessibleProjects(unknownUser);

      expect(result).toEqual([]);
    });

    it('returns empty array for users with no coaching relationships', async () => {
      const result = await AccessControl.getAccessibleProjects(clientUser);

      expect(result).toEqual([]);
    });
  });

  describe('edge cases and error handling', () => {
    it('handles empty project arrays gracefully', async () => {
      const mockModel = createMockResourceModel([]);

      const result = await AccessControl.getFilteredResources(pmUser, {
        resourceModel: mockModel,
        projectIdField: 'projectId',
      });

      expect(result).toEqual([]);
    });

    it('handles resources with missing optional fields', async () => {
      const mockResources = [{ _id: '1', clientId: clientUser._id }];
      const mockModel = createMockResourceModel(mockResources);

      const result = await AccessControl.getFilteredResources(clientUser, {
        resourceModel: mockModel,
        clientIdField: 'clientId',
      });

      expect(result).toEqual(mockResources);
    });

    it('works with different ObjectId types', async () => {
      const project = await createProject({ managerIds: [pmUser._id] });
      const mockResources = [
        {
          _id: '1',
          clientId: 'client1',
          coachId: 'coach1',
          projectId: project._id.toString(),
        },
      ];
      const mockModel = createMockResourceModel(mockResources);

      const result = await AccessControl.getFilteredResources(pmUser, {
        resourceModel: mockModel,
        projectIdField: 'projectId',
      });

      expect(result).toEqual(mockResources);
    });
  });
});
