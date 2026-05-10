import Pillar from '../models/Pillar.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

// @desc    Get all pillars (sorted by order)
// @route   GET /api/pillars
// @access  Public
export const getPillars = async (req, res, next) => {
    try {
        const pillars = await Pillar.find().sort({ order: 1, createdAt: 1 });
        res.json(pillars);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a pillar
// @route   POST /api/pillars
// @access  Private (Admin/SuperAdmin)
export const createPillar = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/pillars',
                transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
            });
            payload.image = result.secure_url;
        }

        const pillar = await Pillar.create(payload);
        res.status(201).json(pillar);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a pillar
// @route   PUT /api/pillars/:id
// @access  Private (Admin/SuperAdmin)
export const updatePillar = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/pillars',
                transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
            });
            payload.image = result.secure_url;
        }

        const pillar = await Pillar.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );
        if (!pillar) {
            return res.status(404).json({ error: 'Pillar not found' });
        }
        res.json(pillar);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a pillar
// @route   DELETE /api/pillars/:id
// @access  Private (Admin/SuperAdmin)
export const deletePillar = async (req, res, next) => {
    try {
        const pillar = await Pillar.findById(req.params.id);
        if (!pillar) {
            return res.status(404).json({ error: 'Pillar not found' });
        }
        await pillar.deleteOne();
        res.json({ message: 'Pillar removed' });
    } catch (error) {
        next(error);
    }
};
