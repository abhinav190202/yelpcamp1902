const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url : String,
    filename : String
})

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
})

const campGroundSchema = new Schema({
    title : String,
    images : [imageSchema],
    price : Number,
    description : String,
    location : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
})
campGroundSchema.post('findOneAndDelete',async function(camp){
    if(camp){
        await Review.deleteMany({_id : {$in : camp.reviews}})
    }
})
module.exports = mongoose.model('Campground',campGroundSchema);