import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../src/app';
import User from '../src/models/User';
import { Project } from '../src/models/Project';
import { createUser, createProject, createCoaching } from './factories';

describe('GET /projects (with in-memory MongoDB)', () => {
  it('returns 401 if no X-User-Id header is provided', async () => {
    const response = await request(app.callback()).get('/projects').expect(401);
    expect(response.body).toHaveProperty('error');
  });

  it('returns 401 if user ID is invalid format', async () => {
    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', 'invalid-id')
      .expect(401);
    expect(response.body).toEqual({ error: 'Invalid user ID format' });
  });

  it('returns 401 if user not found', async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', nonExistingId)
      .expect(401);
    expect(response.body).toEqual({ error: 'Invalid user ID' });
  });

  it('returns all projects for ops user', async () => {
    const ops = await createUser({ role: 'ops' } as any);
    const p1 = await createProject();
    const p2 = await createProject();

    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', ops._id.toString())
      .expect(200);

    const ids = response.body.map((p: any) => p._id);

    expect(ids).toEqual(
      expect.arrayContaining([p1._id.toString(), p2._id.toString()])
    );
    expect(response.body.length).toBe(2);
  });

  it('returns only projects managed by pm user', async () => {
    const pm = await createUser({ role: 'pm' } as any);
    const otherPm = await createUser({ role: 'pm' } as any);
    const managed = await Project.create({ managerIds: [pm._id] });
    await Project.create({ managerIds: [otherPm._id] });

    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', pm._id.toString())
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(managed._id.toString());
  });

  it('returns projects through coaching for client user (current behavior)', async () => {
    const client = await createUser({ role: 'client' } as any);

    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', client._id.toString())
      .expect(403);

    expect(response.body).toEqual({ error: 'Forbidden' });
  });

  it('returns projects through coaching for coach user (current behavior)', async () => {
    const coach = await createUser({ role: 'coach' } as any);

    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', coach._id.toString())
      .expect(403);

    expect(response.body).toEqual({ error: 'Forbidden' });
  });

  it('returns 403 for users with unknown roles', async () => {
    const unknown = await User.create({
      firstName: 'Unknown',
      lastName: 'Role',
      role: 'ops' as any,
    });

    // Override role in memory to emulate bad data
    await User.updateOne({ _id: unknown._id }, {
      $set: { role: 'unknown' },
    } as any);
    const refreshed = await User.findById(unknown._id);

    const response = await request(app.callback())
      .get('/projects')
      .set('X-User-Id', refreshed!._id.toString())
      .expect(403);

    expect(response.body).toEqual({ error: 'Forbidden' });
  });
});
