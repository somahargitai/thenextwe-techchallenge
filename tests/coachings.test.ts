import request from 'supertest';

import { app } from '../src/app';
import User from '../src/models/User';
import { Project } from '../src/models/Project';
import { Coaching } from '../src/models/Coaching';

// Mock mongoose models
jest.mock('../src/models/User');
jest.mock('../src/models/Project');
jest.mock('../src/models/Coaching');

const mockUser = User as jest.Mocked<typeof User>;
const mockProject = Project as jest.Mocked<typeof Project>;
const mockCoaching = Coaching as jest.Mocked<typeof Coaching>;

describe('Coaching Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /coachings', () => {
    it('should return 401 without X-User-Id header', async () => {
      const response = await request(app.callback())
        .get('/coachings')
        .expect(401);

      expect(response.body.error).toBe('Missing X-User-Id header');
    });

    it('should return 401 with invalid X-User-Id header', async () => {
      const response = await request(app.callback())
        .get('/coachings')
        .set('X-User-Id', 'invalid-id')
        .expect(401);

      expect(response.body.error).toBe('Invalid user ID format');
    });

    it('should return 401 with non-existent user ID', async () => {
      const validUserId = '507f1f77bcf86cd799439011';
      mockUser.findById.mockResolvedValue(null);

      const response = await request(app.callback())
        .get('/coachings')
        .set('X-User-Id', validUserId)
        .expect(401);

      expect(response.body.error).toBe('Invalid user ID');
      expect(mockUser.findById).toHaveBeenCalledWith(validUserId);
    });

    describe('Client role access', () => {
      it('should return only coachings where user is the client', async () => {
        const validUserId = '507f1f77bcf86cd799439011';
        const mockClientUser = {
          _id: validUserId,
          role: 'client',
          firstName: 'Test',
          lastName: 'Client'
        };
        const mockCoachings = [
          {
            _id: '507f1f77bcf86cd799439020',
            clientId: validUserId,
            coachId: '507f1f77bcf86cd799439013',
            projectId: '507f1f77bcf86cd799439014'
          },
          {
            _id: '507f1f77bcf86cd799439021',
            clientId: validUserId,
            coachId: '507f1f77bcf86cd799439015',
            projectId: '507f1f77bcf86cd799439016'
          }
        ];

        mockUser.findById.mockResolvedValue(mockClientUser as any);
        mockCoaching.find.mockResolvedValue(mockCoachings as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(200);

        expect(response.body).toEqual(mockCoachings);
        expect(mockCoaching.find).toHaveBeenCalledWith({ clientId: validUserId });
      });

      it('should return empty array when client has no coachings', async () => {
        const validUserId = '507f1f77bcf86cd799439011';
        const mockClientUser = {
          _id: validUserId,
          role: 'client',
          firstName: 'Lonely',
          lastName: 'Client'
        };

        mockUser.findById.mockResolvedValue(mockClientUser as any);
        mockCoaching.find.mockResolvedValue([]);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(200);

        expect(response.body).toEqual([]);
        expect(mockCoaching.find).toHaveBeenCalledWith({ clientId: validUserId });
      });
    });

    describe('Coach role access', () => {
      it('should return only coachings where user is the coach', async () => {
        const validUserId = '507f1f77bcf86cd799439012';
        const mockCoachUser = {
          _id: validUserId,
          role: 'coach',
          firstName: 'Test',
          lastName: 'Coach'
        };
        const mockCoachings = [
          {
            _id: '507f1f77bcf86cd799439020',
            clientId: '507f1f77bcf86cd799439013',
            coachId: validUserId,
            projectId: '507f1f77bcf86cd799439014'
          }
        ];

        mockUser.findById.mockResolvedValue(mockCoachUser as any);
        mockCoaching.find.mockResolvedValue(mockCoachings as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(200);

        expect(response.body).toEqual(mockCoachings);
        expect(mockCoaching.find).toHaveBeenCalledWith({ coachId: validUserId });
      });

      it('should return empty array when coach has no coachings', async () => {
        const validUserId = '507f1f77bcf86cd799439012';
        const mockCoachUser = {
          _id: validUserId,
          role: 'coach',
          firstName: 'New',
          lastName: 'Coach'
        };

        mockUser.findById.mockResolvedValue(mockCoachUser as any);
        mockCoaching.find.mockResolvedValue([]);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(200);

        expect(response.body).toEqual([]);
        expect(mockCoaching.find).toHaveBeenCalledWith({ coachId: validUserId });
      });
    });

    describe('PM role access', () => {
      it('should return coachings for projects they manage', async () => {
        const validUserId = '507f1f77bcf86cd799439013';
        const projectId1 = '507f1f77bcf86cd799439021';
        const projectId2 = '507f1f77bcf86cd799439022';
        
        const mockPmUser = {
          _id: validUserId,
          role: 'pm',
          firstName: 'Test',
          lastName: 'Manager'
        };
        const mockProjects = [
          { _id: projectId1, managerIds: [validUserId] },
          { _id: projectId2, managerIds: [validUserId] }
        ];
        const mockCoachings = [
          {
            _id: '507f1f77bcf86cd799439020',
            clientId: '507f1f77bcf86cd799439015',
            coachId: '507f1f77bcf86cd799439016',
            projectId: projectId1
          },
          {
            _id: '507f1f77bcf86cd799439025',
            clientId: '507f1f77bcf86cd799439017',
            coachId: '507f1f77bcf86cd799439018',
            projectId: projectId2
          }
        ];

        mockUser.findById.mockResolvedValue(mockPmUser as any);
        mockProject.find.mockResolvedValue(mockProjects as any);
        mockCoaching.find.mockResolvedValue(mockCoachings as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(200);

        expect(response.body).toEqual(mockCoachings);
        expect(mockProject.find).toHaveBeenCalledWith({ managerIds: validUserId });
        expect(mockCoaching.find).toHaveBeenCalledWith({ 
          projectId: { $in: [projectId1, projectId2] } 
        });
      });

      it('should return empty array when PM manages no projects', async () => {
        const validUserId = '507f1f77bcf86cd799439013';
        const mockPmUser = {
          _id: validUserId,
          role: 'pm',
          firstName: 'Isolated',
          lastName: 'Manager'
        };

        mockUser.findById.mockResolvedValue(mockPmUser as any);
        mockProject.find.mockResolvedValue([]);
        mockCoaching.find.mockResolvedValue([]);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(200);

        expect(response.body).toEqual([]);
        expect(mockProject.find).toHaveBeenCalledWith({ managerIds: validUserId });
        expect(mockCoaching.find).toHaveBeenCalledWith({ projectId: { $in: [] } });
      });
    });

    describe('Ops role access', () => {
      it('should return all coachings for ops users', async () => {
        const validUserId = '507f1f77bcf86cd799439014';
        const mockOpsUser = {
          _id: validUserId,
          role: 'ops',
          firstName: 'Test',
          lastName: 'Operations'
        };
        const mockCoachings = [
          {
            _id: '507f1f77bcf86cd799439020',
            clientId: '507f1f77bcf86cd799439012',
            coachId: '507f1f77bcf86cd799439013',
            projectId: '507f1f77bcf86cd799439015'
          },
          {
            _id: '507f1f77bcf86cd799439021',
            clientId: '507f1f77bcf86cd799439016',
            coachId: '507f1f77bcf86cd799439017',
            projectId: '507f1f77bcf86cd799439018'
          },
          {
            _id: '507f1f77bcf86cd799439022',
            clientId: '507f1f77bcf86cd799439019',
            coachId: '507f1f77bcf86cd799439020',
            projectId: '507f1f77bcf86cd799439021'
          }
        ];

        mockUser.findById.mockResolvedValue(mockOpsUser as any);
        mockCoaching.find.mockResolvedValue(mockCoachings as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(200);

        expect(response.body).toEqual(mockCoachings);
        expect(mockCoaching.find).toHaveBeenCalledWith();
      });
    });

    describe('Unknown role handling', () => {
      it('should return 403 for users with unknown roles', async () => {
        const validUserId = '507f1f77bcf86cd799439015';
        const mockUnknownUser = {
          _id: validUserId,
          role: 'unknown',
          firstName: 'Unknown',
          lastName: 'Role'
        };

        mockUser.findById.mockResolvedValue(mockUnknownUser as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(403);

        expect(response.body.error).toBe('Forbidden');
      });
    });

    describe('Database error handling', () => {
      it('should return 401 when user lookup fails', async () => {
        const validUserId = '507f1f77bcf86cd799439016';
        mockUser.findById.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(401);

        expect(response.body.error).toBe('Authentication failed');
        expect(response.body.details).toBe('Database connection failed');
      });

      it('should return 401 when coaching lookup fails for client', async () => {
        const validUserId = '507f1f77bcf86cd799439017';
        const mockClientUser = {
          _id: validUserId,
          role: 'client',
          firstName: 'Test',
          lastName: 'Client'
        };

        mockUser.findById.mockResolvedValue(mockClientUser as any);
        mockCoaching.find.mockRejectedValue(new Error('Coaching lookup failed'));

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId);

        expect(response.status).toBeGreaterThanOrEqual(400);
      });
    });

    describe('Response format validation', () => {
      it('should return coaching objects with correct structure', async () => {
        const validUserId = '507f1f77bcf86cd799439018';
        const mockOpsUser = {
          _id: validUserId,
          role: 'ops',
          firstName: 'Test',
          lastName: 'Operations'
        };
        const mockCoachings = [
          {
            _id: '507f1f77bcf86cd799439020',
            clientId: '507f1f77bcf86cd799439012',
            coachId: '507f1f77bcf86cd799439013',
            projectId: '507f1f77bcf86cd799439014',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z'
          }
        ];

        mockUser.findById.mockResolvedValue(mockOpsUser as any);
        mockCoaching.find.mockResolvedValue(mockCoachings as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', validUserId)
          .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
        
        const coaching = response.body[0];
        expect(coaching).toHaveProperty('_id');
        expect(coaching).toHaveProperty('clientId');
        expect(coaching).toHaveProperty('coachId');
        expect(coaching).toHaveProperty('projectId');
        expect(coaching).toHaveProperty('createdAt');
        expect(coaching).toHaveProperty('updatedAt');
      });
    });
  });
});