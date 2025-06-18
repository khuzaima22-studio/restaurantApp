// models/Menu.js
import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
    items: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId()
            },
            name: {
                type: String,
                trim: true
            },
            price: {
                type: Number
            },
            category: {
                type: String
            },
            image: {
                type: String
            }
        }
    ],

}, {
    timestamps: true
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;
