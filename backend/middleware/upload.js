import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';

// Use memory storage so we can pipe to Cloudinary
const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type '${file.mimetype}' not allowed. Accepted: jpg, png, webp, gif, mp4, webm.`), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max
    }
});

// Middleware to verify magic numbers of uploaded files
export const verifyFileSignature = async (req, res, next) => {
    try {
        const files = [];
        if (req.file) files.push(req.file);
        if (req.files) {
            if (Array.isArray(req.files)) {
                files.push(...req.files);
            } else {
                for (const key in req.files) {
                    files.push(...req.files[key]);
                }
            }
        }

        for (const file of files) {
            if (!file.buffer) continue;
            
            const type = await fileTypeFromBuffer(file.buffer);
            
            if (!type) {
                return res.status(400).json({ error: 'File signature verification failed: Unknown file type.' });
            }

            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
            const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

            if (!allowedTypes.includes(type.mime)) {
                return res.status(400).json({ error: `File signature verification failed. Detected: ${type.mime}` });
            }
        }
        next();
    } catch (err) {
        next(err);
    }
};
