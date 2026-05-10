import multer from 'multer';

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
