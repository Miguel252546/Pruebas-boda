import cloudinary from '../config/cloudinary.js';
import Product from '../models/Product.js';

export const uploadProductImage = async (req, res) => {
    try {
        const { name, description, imageurl } = req.body;

        if (!imageurl) {
            return res.status(400).json({ message: 'La URL de la imagen es obligatoria' });
        }

        // 1. Subir la imagen a Cloudinary
        // Tomamos la URL que viene del frontend y la subimos a nuestra cuenta de Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageurl, {
            folder: 'boda_invitaciones'
        });

        // 2. Guardar la información en MongoDB
        const newProduct = new Product({
            name,
            description,
            imageUrl: uploadResult.secure_url, // URL final optimizada
            publicId: uploadResult.public_id   // ID para gestión futura
        });

        await newProduct.save();

        res.status(201).json({
            message: 'Imagen subida y guardada exitosamente',
            product: newProduct
        });

    } catch (error) {
        console.error('Error en uploadProductImage:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};
