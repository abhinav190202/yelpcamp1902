const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary')

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};
module.exports.renderNewForm = async(req,res)=>{
    res.render('campgrounds/new');
};

module.exports.createCampground = async(req,res)=>{
    const newCampGround = new Campground(req.body.campground);
    newCampGround.images = req.files.map(f=>({url : f.path, filename : f.filename}));
    newCampGround.author = req.user._id;
    await newCampGround.save();
    console.log(newCampGround.images);
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampGround._id}`);
};

module.exports.showCampground = async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path : 'reviews',
        populate : {
            path : 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds'); //Necessary to redirect
    }
    res.render('campgrounds/show',{campground});
};

module.exports.renderEditForm = async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
       req.flash('error','Cannot find that campground!');
       return res.redirect('/campgrounds'); //Necessary to redirect
   }
    res.render('campgrounds/edit',{campground});
};

module.exports.updateCampground = async(req,res)=>{
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground},{new:true});
    const imgs = req.files.map(f=>({url : f.path, filename : f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull : {images : {filename : {$in : req.body.deleteImages}}}});
        console.log(campground);
    }
    req.flash('success','Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async(req,res)=>{
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted a campground!');
    res.redirect('/campgrounds');
};