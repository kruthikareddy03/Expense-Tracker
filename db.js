import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to primary MongoDB at ${uri}: ${error.message}`);
    
    // Attempt fallback to in-memory MongoDB so the project runs out-of-the-box
    try {
      console.log('🔄 Attempting fallback to embedded in-memory MongoDB for local testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Connected to Embedded In-Memory MongoDB: ${conn.connection.host}`);
      console.log('💡 Note: Data will be persisted in memory for this session. Connect to MongoDB Atlas or local mongod for permanent storage.');
    } catch (fallbackError) {
      console.error('❌ MongoDB Connection Error:', error.message);
      console.error('👉 Please make sure MongoDB is running locally (mongod) or provide a valid MONGODB_URI in server/.env');
      // Do not exit process immediately in dev so developers can see the logs
    }
  }
};

export default connectDB;
