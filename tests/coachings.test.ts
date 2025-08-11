import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../src/app';
import User from '../src/models/User';
import { Project } from '../src/models/Project';
import { Coaching } from '../src/models/Coaching';
import { createUser, createProject, createCoaching } from './factories';

describe('Coaching Routes (with in-memory MongoDB)', () => {
  describe('GET /coachings', () => {
    it('returns 401 without X-User-Id header', async () => {
      const response = await request(app.callback())
        .get('/coachings')
        .expect(401);
      expect(response.body.error).toBe('Missing X-User-Id header');
    });

    it('returns 401 with invalid X-User-Id header', async () => {
      const response = await request(app.callback())
        .get('/coachings')
        .set('X-User-Id', 'invalid-id')
        .expect(401);

      expect(response.body.error).toBe('Invalid user ID format');
    });

    it('returns 401 with non-existent user ID', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toHexString();
      const response = await request(app.callback())
        .get('/coachings')
        .set('X-User-Id', nonExistingId)
        .expect(401);

      expect(response.body.error).toBe('Invalid user ID');
    });

    describe('Client role access', () => {
      it('returns only coachings where user is the client', async () => {
        const client = await createUser({ role: 'client' } as any);
        const coach = await createUser({ role: 'coach' } as any);
        const project = await createProject();
        const c1 = await Coaching.create({
          clientId: client._id,
          coachId: coach._id,
          projectId: project._id,
        });
        const c2 = await Coaching.create({
          clientId: client._id,
          coachId: coach._id,
          projectId: project._id,
        });

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', client._id.toString())
          .expect(200);

        const ids = response.body.map((c: any) => c._id);
        expect(ids).toEqual(
          expect.arrayContaining([c1._id.toString(), c2._id.toString()])
        );
      });

      it('returns empty array when client has no coachings', async () => {
        const client = await createUser({ role: 'client' } as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', client._id.toString())
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('Coach role access', () => {
      it('returns only coachings where user is the coach', async () => {
        const coach = await createUser({ role: 'coach' } as any);
        const client = await createUser({ role: 'client' } as any);
        const project = await createProject();
        const c1 = await Coaching.create({
          clientId: client._id,
          coachId: coach._id,
          projectId: project._id,
        });

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', coach._id.toString())
          .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0]._id).toBe(c1._id.toString());
      });

      it('returns empty array when coach has no coachings', async () => {
        const coach = await createUser({ role: 'coach' } as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', coach._id.toString())
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('PM role access', () => {
      it('returns coachings for projects they manage', async () => {
        const pm = await createUser({ role: 'pm' } as any);
        const client = await createUser({ role: 'client' } as any);
        const coach = await createUser({ role: 'coach' } as any);
        const project1 = await Project.create({ managerIds: [pm._id] });
        const project2 = await Project.create({ managerIds: [pm._id] });
        const c1 = await Coaching.create({
          clientId: client._id,
          coachId: coach._id,
          projectId: project1._id,
        });
        const c2 = await Coaching.create({
          clientId: client._id,
          coachId: coach._id,
          projectId: project2._id,
        });

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', pm._id.toString())
          .expect(200);

        const ids = response.body.map((c: any) => c._id);
        expect(ids).toEqual(
          expect.arrayContaining([c1._id.toString(), c2._id.toString()])
        );
      });

      it('returns empty array when PM manages no projects', async () => {
        const pm = await createUser({ role: 'pm' } as any);

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', pm._id.toString())
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('Ops role access', () => {
      it('returns all coachings for ops users', async () => {
        const ops = await createUser({ role: 'ops' } as any);
        const c1 = await createCoaching();
        const c2 = await createCoaching();
        const c3 = await createCoaching();

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', ops._id.toString())
          .expect(200);

        const ids = response.body.map((c: any) => c._id);
        expect(ids).toEqual(
          expect.arrayContaining([
            c1._id.toString(),
            c2._id.toString(),
            c3._id.toString(),
          ])
        );
      });
    });

    describe('Unknown role handling', () => {
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
          .get('/coachings')
          .set('X-User-Id', refreshed!._id.toString())
          .expect(403);

        expect(response.body.error).toBe('Forbidden');
      });
    });

    describe('Response format validation', () => {
      it('returns coaching objects with expected structure', async () => {
        const ops = await createUser({ role: 'ops' } as any);
        await createCoaching();

        const response = await request(app.callback())
          .get('/coachings')
          .set('X-User-Id', ops._id.toString())
          .expect(200);

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
