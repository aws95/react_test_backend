const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    sizes: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);