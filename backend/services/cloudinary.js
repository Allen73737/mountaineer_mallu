import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options (folder, transformation, resource_type)
 * @returns {Promise} Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: options.folder || 'mountaineer-mallu',
            resource_type: options.resource_type || 'auto',
            ...options
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(new Error('Media upload failed. Please try again.'));
                } else {
                    // Force f_auto, q_auto optimizations for the returned URL
                    // This ensures database URLs are already optimized without client-side parsing
                    if (result && result.secure_url) {
                        const urlParts = result.secure_url.split('/upload/');
                        if (urlParts.length === 2) {
                            if (result.resource_type === 'image') {
                                result.secure_url = `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`;
                            } else if (result.resource_type === 'video') {
                                // For video, q_auto:best to maintain clarity while optimizing
                                result.secure_url = `${urlParts[0]}/upload/f_auto,q_auto:best/${urlParts[1]}`;
                            }
                        }
                    }
                    resolve(result);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * Delete a resource from Cloudinary by public_id
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
    }
};

export default cloudinary;
