import express from 'express';
import connectDB from './src/config/db.js';
import productRoutes from './src/routes/product.routes.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Conexión a la Base de Datos MongoDB
connectDB();

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Rutas
app.use('/products', productRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('🚀 Servidor de la Boda corriendo correctamente');
});

app.listen(PORT, () => {
    console.log(`✅ Servidor iniciado en http://localhost:${PORT}`);
});
