import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
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
    Order: [
        {
            name: String,
            qty: Number
        }
    ],
    paid: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
