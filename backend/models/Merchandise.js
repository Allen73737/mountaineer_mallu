import mongoose from 'mongoose';

const merchandiseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price must be positive']
    },
    currency: {
        type: String,
        default: '₹'
    },
    image: {
        type: String,
        required: [true, 'Image URL is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    badge: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Merchandise = mongoose.model('Merchandise', merchandiseSchema);
export default Merchandise;
