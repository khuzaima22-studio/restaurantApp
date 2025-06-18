// models/User.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: Number,
        required: true,
    },
    seats: {
        type: Number,
        required: true,
        min: 1
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', "refused", "expired", "completed"],
        default: 'pending'
    }
}, {
    timestamps: true
});

const booking = mongoose.model('Booking', bookingSchema);

export default booking;
