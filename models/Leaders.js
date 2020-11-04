const { TooManyRequests } = require('http-errors');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

// const commentSchema = new Schema({
//     rating: {
//         type: Number,
//         min: 1,
//         max: 5,
//         required: true
//     },
//     comment: {
//         type: String,
//         required: true
//     },
//     author: {
//         type: String,
//         required: true
//     }
// },{ 
//     timestamps: true
    
// });

const leadersSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    abbr: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default:false      
    } //,
    // comments:[commentSchema]
}, 
{
    timestamps: true
});

var Leaders = mongoose.model('Leader', leadersSchema);

module.exports = Leaders;