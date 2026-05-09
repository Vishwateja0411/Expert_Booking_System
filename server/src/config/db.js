import mongoose from 'mongoose';

function isAtlasUri(uri) {
  return uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net');
}

function isNetworkAccessError(error) {
  const message = `${error.message || ''} ${error.reason?.type || ''}`.toLowerCase();
  return (
    message.includes('serverselection') ||
    message.includes('replicasetnoprimary') ||
    message.includes('tls') ||
    message.includes('ssl') ||
    message.includes('network')
  );
}

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required in environment variables.');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('MongoDB connected');
  } catch (error) {
    if (isAtlasUri(mongoUri) && isNetworkAccessError(error)) {
      throw new Error(
        'MongoDB Atlas connection failed. Add your current public IP address to Atlas Network Access, ' +
        'or use a local MongoDB URI in MONGO_URI for development.'
      );
    }

    throw error;
  }
}
