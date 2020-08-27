const mongoose = require('mongoose');

const CartSchema = mongoose.Schema({
    products: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    user: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Cart', CartSchema);