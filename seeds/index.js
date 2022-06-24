const mongoose = require('mongoose');
const cities = require('./cities')
const {descriptors,places} = require('./seedHelpers')
const Campground = require('../models/campground') //Backing out one directory


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const sample  = array => array[Math.floor(Math.random()*array.length)]

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author : '62b0c580ec2d7bf0fc6dd5c9',
            location : `${cities[random1000].city},${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            description : 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sapiente dolorem ipsum exercitationem eaque animi fugiat cumque cupiditate nobis cum totam delectus vitae, minus ipsa dignissimos voluptatem repudiandae laboriosam. Perferendis, praesentium!',
            price,
            images : [
                  {
                    url: 'https://res.cloudinary.com/dfnt0wmgr/image/upload/v1655965174/YelpCamp/gmhlqkceqs33r8sko35f.jpg',
                    filename: 'YelpCamp/gmhlqkceqs33r8sko35f'
                  },
                  {
                    url: 'https://res.cloudinary.com/dfnt0wmgr/image/upload/v1655965175/YelpCamp/dn89904j9je3fvkfdwlx.jpg',
                    filename: 'YelpCamp/dn89904j9je3fvkfdwlx'
                  }
                
            ]
        })
        await camp.save();
    }

}
seedDB()
.then(()=>{
    mongoose.connection.close()
});