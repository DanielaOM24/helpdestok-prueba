import connectDB from './mongodb';

async function testConnection() {
    try {
        console.log('🔌 Intentando conectar a MongoDB...');
        console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configurada' : 'NO CONFIGURADA');

        await connectDB();
        console.log('✅ Conexión a MongoDB exitosa!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        console.error('Detalles:', error);
        process.exit(1);
    }
}

testConnection();

