import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdeskpro';

if (!MONGODB_URI) {
    throw new Error('Por favor define la variable de entorno MONGODB_URI en .env.local');
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB conectado exitosamente');
            return mongoose;
        }).catch((error) => {
            console.error('❌ Error conectando a MongoDB:', error.message);
            cached.promise = null;
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e: any) {
        cached.promise = null;
        console.error('❌ Error en conexión MongoDB:', e?.message || e);
        throw e;
    }

    return cached.conn;
}

export default connectDB;

