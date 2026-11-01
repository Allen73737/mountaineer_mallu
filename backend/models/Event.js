import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: 200
    },
    date: {
        type: String,
        required: [true, 'Event date is required']
    },
    time: {
        type: String,
        required: [true, 'Event time is required']
    },
    location: {
        type: String,
        required: [true, 'Event location is required'],
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        required: true
    },
    totalSlots: {
        type: Number,
        required: true,
        min: 1
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    whatsappGroupUrl: {
        type: String,
        default: '',
        trim: true
    },
    ticketUrl: {
        type: String,
        default: '',
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Event image is required']
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Virtual for remaining slots
eventSchema.virtual('slotsLeft').get(function () {
    return this.totalSlots - this.participants.length;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

eventSchema.index({ date: 1 });
eventSchema.index({ date: 1, createdAt: -1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
