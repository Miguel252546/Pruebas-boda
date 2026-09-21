import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true }, // URL que nos dará Cloudinary
    publicId: { type: String, required: true },   // ID de Cloudinary para poder borrar la foto luego
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
