const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas.js')

module.exports.isLoggedIn = (req,res,next)=>{
    //console.log("REQ.USER...",req.user); //Already added by passport, which contains the deserialized information from the session.
    if(!req.isAuthenticated()){
        // console.log(req.path, req.originalUrl); //req.path shows the path in which isLoggedIn was invoked, req.originalUrl shows the path where the user was trying to go
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in first!');
        return res.redirect('/login')
    }
    next();
}

module.exports.validateCampground = (req,res,next)=>{
    const {error} =  campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(','); //Iterating over the details object of error returned by JOI
        throw new ExpressError(400,msg);
    }
    else{
        next();
    }
}

module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(','); //Iterating over the details object of error returned by JOI
        throw new ExpressError(400,msg);
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
