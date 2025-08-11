import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

import User from './models/User';

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

const listUsers = async () => {
  try {
    await connectDB();

    const users = await User.find({}).select('_id firstName lastName role');
    
    console.log('\n👥 Available Users for API Testing:');
    console.log('=====================================\n');
    
    users.forEach(user => {
      console.log(`ID: ${user._id} | 👉 Role: ${user.role} \t| Name: ${user.firstName} ${user.lastName}`);
    });
    
    console.log('\n💡 Usage:\n');
    console.log(`🚀 In Swagger:`)
    console.log(`   Click 'Authorize' and paste a user ID from the list`)
    console.log(`💡 In Postman:`)
    console.log('   Add the user ID to your request header as:');
    console.log('   X-User-Id: <user_id_from_above>');
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

if (require.main === module) {
  listUsers();
}

export { listUsers };