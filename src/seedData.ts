import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User, { UserRole } from './models/User';
import { Coaching } from './models/Coaching';
import { Project } from './models/Project';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://admin:password@localhost:27017/koa_api?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('📦 MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  await User.deleteMany({});
  await Project.deleteMany({});
  await Coaching.deleteMany({});
  console.log('✅ Database cleared');
};

const createUsers = async () => {
  const users = [
    // Clients
    { role: 'client' as UserRole, firstName: 'Bambi', lastName: 'Deer' },
    { role: 'client' as UserRole, firstName: 'Tiny', lastName: 'Tim' },
    { role: 'client' as UserRole, firstName: 'Oliver', lastName: 'Twist' },
    { role: 'client' as UserRole, firstName: 'Cindy', lastName: 'Princess' },
    { role: 'client' as UserRole, firstName: 'Dorothy', lastName: 'Gale' },
    { role: 'client' as UserRole, firstName: 'Alice', lastName: 'Wonderland' },

    // Coaches
    { role: 'coach' as UserRole, firstName: 'Sherlock', lastName: 'Holmes' },
    { role: 'coach' as UserRole, firstName: 'Hercule', lastName: 'Poirot' },
    { role: 'coach' as UserRole, firstName: 'Clarice', lastName: 'Starling' },
    { role: 'coach' as UserRole, firstName: 'Jim', lastName: 'Gordon' },

    // Project Managers
    { role: 'pm' as UserRole, firstName: 'Tony', lastName: 'Stark' },
    { role: 'pm' as UserRole, firstName: 'Steve', lastName: 'Rogers' },
    { role: 'pm' as UserRole, firstName: 'Natasha', lastName: 'Romanoff' },

    // Operations
    { role: 'ops' as UserRole, firstName: 'Gandalf', lastName: 'the Grey' },
    { role: 'ops' as UserRole, firstName: 'Merlin', lastName: 'of Camelot' },
    { role: 'ops' as UserRole, firstName: 'Albus', lastName: 'Dumbledore' },
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

const createProjects = async (users: any[]) => {
  const pmUsers = users.filter((user) => user.role === 'pm');
  const opsUsers = users.filter((user) => user.role === 'ops');

  const projects = [
    {
      managerIds: [pmUsers[0]._id, opsUsers[0]._id],
    },
    {
      managerIds: [pmUsers[1]._id],
    },
    {
      managerIds: [pmUsers[2]._id, opsUsers[1]._id, opsUsers[2]._id],
    },
    {
      managerIds: [pmUsers[0]._id, pmUsers[1]._id],
    },
    {
      managerIds: [opsUsers[0]._id],
    },
  ];

  const createdProjects = await Project.insertMany(projects);
  console.log(`✅ Created ${createdProjects.length} projects`);
  return createdProjects;
};

const createCoachings = async (users: any[], projects: any[]) => {
  const clients = users.filter((user) => user.role === 'client');
  const coaches = users.filter((user) => user.role === 'coach');

  const coachings = [
    {
      clientId: clients[0]._id,
      coachId: coaches[0]._id,
      projectId: projects[0]._id,
    },
    {
      clientId: clients[1]._id,
      coachId: coaches[0]._id,
      projectId: projects[0]._id,
    },
    {
      clientId: clients[2]._id,
      coachId: coaches[1]._id,
      projectId: projects[1]._id,
    },
    {
      clientId: clients[3]._id,
      coachId: coaches[2]._id,
      projectId: projects[2]._id,
    },
    {
      clientId: clients[4]._id,
      coachId: coaches[3]._id,
      projectId: projects[3]._id,
    },
    {
      clientId: clients[0]._id,
      coachId: coaches[1]._id,
      projectId: projects[4]._id,
    },
    {
      clientId: clients[2]._id,
      coachId: coaches[3]._id,
      projectId: projects[2]._id,
    },
  ];

  const createdCoachings = await Coaching.insertMany(coachings);
  console.log(`✅ Created ${createdCoachings.length} coaching relationships`);
  return createdCoachings;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    await clearDatabase();

    const users = await createUsers();
    const projects = await createProjects(users);
    const coachings = await createCoachings(users, projects);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(
      `      - Clients: ${users.filter((u) => u.role === 'client').length}`
    );
    console.log(
      `      - Coaches: ${users.filter((u) => u.role === 'coach').length}`
    );
    console.log(`      - PMs: ${users.filter((u) => u.role === 'pm').length}`);
    console.log(`      - Ops: ${users.filter((u) => u.role === 'ops').length}`);
    console.log(`   📁 Projects: ${projects.length}`);
    console.log(`   🎯 Coaching relationships: ${coachings.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
