import mongoose from 'mongoose';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

const getDatabaseConfig = (): DatabaseConfig => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swasthyamitra';
  
  return {
    uri: mongoUri,
    options: {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    } as any
  };
};

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  constructor() {
    // Setup connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ Database connected successfully');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Database connection error:', err);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Database disconnected');
      this.isConnected = false;
    });

    // Handle app termination (prevent duplicate listeners during hot reloads)
    if ((global as any).__dbGracefulExit) {
      process.removeListener('SIGINT', (global as any).__dbGracefulExit);
      process.removeListener('SIGTERM', (global as any).__dbGracefulExit);
    }
    (global as any).__dbGracefulExit = this.gracefulExit;
    process.on('SIGINT', this.gracefulExit);
    process.on('SIGTERM', this.gracefulExit);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const config = getDatabaseConfig();
      console.log('🔌 Connecting to database...');
      await mongoose.connect(config.uri, config.options);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      console.log('Database disconnected gracefully');
    } catch (error) {
      console.error('Error during database disconnection:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  private gracefulExit = async (): Promise<void> => {
    console.log('🔄 Received termination signal, closing database connection...');
    try {
      await this.disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful exit:', error);
      process.exit(1);
    }
  };
}

export const database = Database.getInstance();
export default database;