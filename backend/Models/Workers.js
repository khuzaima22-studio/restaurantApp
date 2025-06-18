// models/User.js
import mongoose from 'mongoose';

const WorkerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
}, {
    timestamps: true
});

const worker = mongoose.model('Worker', WorkerSchema);

export default worker;
