import mongoose from 'mongoose';
import dns from 'dns';

// Fix for querySrv ECONNREFUSED on certain DNS configurations
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
  console.warn('Warning: Failed to set DNS servers to Google DNS:', error.message);
}

// Disable buffering so queries fail immediately when offline rather than hanging
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error");
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
