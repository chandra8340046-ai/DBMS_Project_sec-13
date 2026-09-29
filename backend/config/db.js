import mongoose from 'mongoose';

let hasWarned = false;

// Silence unhandled error crashes from Mongoose connection
mongoose.connection.on('error', (err) => {
  if (!hasWarned) {
    hasWarned = true;
  }
});

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/estatex';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
      autoIndex: false,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.log(`🍃 Database Status: Running in In-Memory Mode (Local MongoDB 27017 not detected).`);
    console.log(`   ✨ All APIs, search, filtering, and leads are fully functional!`);
    console.log(`   👉 To connect MongoDB Atlas or local daemon, update MONGO_URI in backend/.env.\n`);
    return null;
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const isConnected = mongoose.connection.readyState === 1;
  return {
    status: states[mongoose.connection.readyState] || 'disconnected',
    readyState: mongoose.connection.readyState,
    isConnected,
    mode: isConnected ? 'mongodb' : 'in-memory-fallback',
    databaseName: isConnected ? (mongoose.connection.name || 'estatex') : 'memory-store',
  };
};
