import express from 'express';
import { uploadProductImage, getAllProducts } from '../controllers/product.controller.js';

const router = express.Router();

// Ruta para subir una imagen y guardarla en la DB
router.post('/upload', uploadProductImage);

// Ruta para obtener todas las imágenes guardadas
router.get('/all', getAllProducts);

export default router;
