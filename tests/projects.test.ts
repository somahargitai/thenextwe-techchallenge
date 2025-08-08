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

describe('GET /projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no X-User-Id header is provided', async () => {
    const response = await request(app.callback())
      .get('/projects')
      .expect(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 401 if user ID is invalid format', async () => {
    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', 'invalid-id')
      .expect(401);
    expect(response.body).toEqual({ error: 'Invalid user ID format' });
  });

  it('should return 401 if user not found', async () => {
    const validUserId = '507f1f77bcf86cd799439011';
    mockUser.findById.mockResolvedValue(null);
    
    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', validUserId)
      .expect(401);
    expect(response.body).toEqual({ error: 'Invalid user ID' });
  });

  it('should return all projects for ops user', async () => {
    const validUserId = '507f1f77bcf86cd799439011';
    const mockOpsUser = {
      _id: validUserId,
      role: 'ops',
      firstName: 'Admin',
      lastName: 'User'
    };
    const mockProjects = [
      { _id: '1', managerIds: ['manager1'] },
      { _id: '2', managerIds: ['manager2'] }
    ];

    mockUser.findById.mockResolvedValue(mockOpsUser as any);
    mockProject.find.mockResolvedValue(mockProjects as any);
    
    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', validUserId)
      .expect(200);
    
    expect(response.body).toEqual(mockProjects);
    expect(mockProject.find).toHaveBeenCalledWith();
  });

  it('should return filtered projects for pm user', async () => {
    const validUserId = '507f1f77bcf86cd799439011';
    const mockPmUser = {
      _id: validUserId,
      role: 'pm',
      firstName: 'PM',
      lastName: 'User'
    };
    const mockProjects = [
      { _id: '1', managerIds: [validUserId] }
    ];

    mockUser.findById.mockResolvedValue(mockPmUser as any);
    mockProject.find.mockResolvedValue(mockProjects as any);
    
    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', validUserId)
      .expect(200);
    
    expect(response.body).toEqual(mockProjects);
    expect(mockProject.find).toHaveBeenCalledWith({ managerIds: validUserId });
  });

  it('should return projects through coaching for client user', async () => {
    const validUserId = '507f1f77bcf86cd799439011';
    const projectId1 = '507f1f77bcf86cd799439021';
    const projectId2 = '507f1f77bcf86cd799439022';
    
    const mockClientUser = {
      _id: validUserId,
      role: 'client',
      firstName: 'Client',
      lastName: 'User'
    };
    const mockCoachings = [
      { clientId: validUserId, coachId: 'coach1', projectId: projectId1 },
      { clientId: validUserId, coachId: 'coach2', projectId: projectId2 }
    ];
    const mockProjects = [
      { _id: projectId1, managerIds: ['manager1'] },
      { _id: projectId2, managerIds: ['manager2'] }
    ];

    mockUser.findById.mockResolvedValue(mockClientUser as any);
    mockCoaching.find.mockResolvedValue(mockCoachings as any);
    mockProject.find.mockResolvedValue(mockProjects as any);
    
    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', validUserId)
      .expect(200);
    
    expect(response.body).toEqual(mockProjects);
    expect(mockCoaching.find).toHaveBeenCalledWith({ clientId: validUserId });
    expect(mockProject.find).toHaveBeenCalledWith({ _id: { $in: [projectId1, projectId2] } });
  });

  it('should return projects through coaching for coach user', async () => {
    const validUserId = '507f1f77bcf86cd799439011';
    const projectId1 = '507f1f77bcf86cd799439021';
    
    const mockCoachUser = {
      _id: validUserId,
      role: 'coach',
      firstName: 'Coach',
      lastName: 'User'
    };
    const mockCoachings = [
      { clientId: 'client1', coachId: validUserId, projectId: projectId1 }
    ];
    const mockProjects = [
      { _id: projectId1, managerIds: ['manager1'] }
    ];

    mockUser.findById.mockResolvedValue(mockCoachUser as any);
    mockCoaching.find.mockResolvedValue(mockCoachings as any);
    mockProject.find.mockResolvedValue(mockProjects as any);
    
    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', validUserId)
      .expect(200);
    
    expect(response.body).toEqual(mockProjects);
    expect(mockCoaching.find).toHaveBeenCalledWith({ coachId: validUserId });
    expect(mockProject.find).toHaveBeenCalledWith({ _id: { $in: [projectId1] } });
  });
});