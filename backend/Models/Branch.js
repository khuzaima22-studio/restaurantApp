// models/User.js
import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    cuisines: {
        type: [String],
        enum: ['italian', 'chinese', 'indian', 'mexican', 'american', 'thai', 'japanese', 'french', 'mediterranean','other'],
        default: ['italian'],
        lowercase: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
    },
    image: {
        type: String
    }

}, {
    timestamps: true
});

const branch = mongoose.model('Branch', branchSchema);

export default branch;
