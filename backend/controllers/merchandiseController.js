import Merchandise from '../models/Merchandise.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

// Get all merchandise
export const getMerchandises = async (req, res) => {
    try {
        const items = await Merchandise.find().sort({ order: 1, createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching merchandise:', error);
        res.status(500).json({ message: 'Error fetching merchandise' });
    }
};

// Create new merchandise (Admin only)
export const createMerchandise = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/merchandise',
                transformation: [{ width: 1000, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
            });
            payload.image = result.secure_url;
        }

        const item = new Merchandise(payload);
        const savedItem = await item.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating merchandise:', error);
        res.status(400).json({ message: error.message || 'Error creating merchandise' });
    }
};

// Update merchandise (Admin only)
export const updateMerchandise = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/merchandise',
                transformation: [{ width: 1000, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
            });
            payload.image = result.secure_url;
        }

        const item = await Merchandise.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );
        
        if (!item) {
            return res.status(404).json({ message: 'Merchandise not found' });
        }
        
        res.json(item);
    } catch (error) {
        console.error('Error updating merchandise:', error);
        res.status(400).json({ message: error.message || 'Error updating merchandise' });
    }
};

// Delete merchandise (Admin only)
export const deleteMerchandise = async (req, res) => {
    try {
        const item = await Merchandise.findByIdAndDelete(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Merchandise not found' });
        }
        
        res.json({ message: 'Merchandise deleted successfully' });
    } catch (error) {
        console.error('Error deleting merchandise:', error);
        res.status(500).json({ message: 'Error deleting merchandise' });
    }
};
