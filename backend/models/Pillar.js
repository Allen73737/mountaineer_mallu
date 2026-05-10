import mongoose from 'mongoose';

const pillarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        trim: true
    },
    quote: {
        type: String,
        required: [true, 'Quote is required'],
        trim: true,
        maxlength: [200, 'Quote cannot be more than 200 characters']
    },
    image: {
        type: String,
        required: [true, 'Image URL is required']
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Pillar = mongoose.model('Pillar', pillarSchema);
export default Pillar;
