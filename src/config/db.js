import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('La variable MONGODB_URI no está definida en el archivo .env');
        }
        await mongoose.connect(uri);
        console.log('✅ MongoDB conectado exitosamente');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        throw error; // Lanzamos el error para que el script de migración sepa que falló
    }
};

export default connectDB;
