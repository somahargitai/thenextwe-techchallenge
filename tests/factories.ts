import User, { IUser, UserRole } from '../src/models/User';
import { Project, ProjectDocument } from '../src/models/Project';
import { Coaching, ICoaching } from '../src/models/Coaching';

export async function createUser(
  overrides: Partial<IUser> = {} as Partial<IUser>
) {
  const base = {
    role: 'client' as UserRole,
    firstName: 'Test',
    lastName: 'User',
  };
  const user = await User.create({ ...base, ...overrides });
  return user;
}

export async function createProject(
  overrides: Partial<ProjectDocument> = {} as Partial<ProjectDocument>
) {
  const manager = await createUser({ role: 'pm' as UserRole });
  const base = {
    managerIds: [manager._id],
  } as Partial<ProjectDocument>;
  const project = await Project.create({ ...base, ...overrides });
  return project;
}

export async function createCoaching(
  overrides: Partial<ICoaching> = {} as Partial<ICoaching>
) {
  const client = await createUser({ role: 'client' as UserRole });
  const coach = await createUser({ role: 'coach' as UserRole });
  const project = await createProject();

  const base = {
    clientId: client._id,
    coachId: coach._id,
    projectId: project._id,
  } as Partial<ICoaching>;

  const coaching = await Coaching.create({ ...base, ...overrides });
  return coaching;
}
