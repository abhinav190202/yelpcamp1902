if(process.env.NODE_ENV !== 'production'){ //This ensures that the dotenv files which contains the details of our cloudinary account won't be accessible when the project is in production mode and not in development mode
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport'); //user PBKDF2 hashing method
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const app = express();

app.engine('ejs',ejsMate); //There are many engines used to make sense of ejs syntax and stuff. So we want to use this engine instead of the default one
app.set('view engine','ejs'); 
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
    mongoUrl : dbUrl,
    secret,
    touchAfter : 24 * 60 * 60 //In seconds
});

store.on("error",function(e){
    console.log("Session store error",e);
})

const sessionConfig = {
    store : store,
    name : 'session', //default name is connect.sid
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        // secure : true, //This will break things as of now as localhost is not secure
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7, //expiration date of cookie is set to a week from page loading
        maxAge : 1000 * 60 * 60 * 24 * 7 //In milliseconds
    }
}
app.use(session(sessionConfig)); //this should be wriiten before writing the passport.session statement
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfnt0wmgr/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize()); //To use Passport in an Express or Connect-based application, configure it with the required passport.initialize() middleware. 
app.use(passport.session()); //If your application uses persistent login sessions (recommended, but not required), passport.session() middleware must also be used.
passport.use(new LocalStrategy(User.authenticate())); //authenticate, serializeUser and deserializeUser are static functions added to the userSchema when downloading passport-local-mongoose in models folder
passport.serializeUser(User.serializeUser()); //to get a user into a session
passport.deserializeUser(User.deserializeUser()); //to get a user out of a session
app.use(mongoSanitize()); //Doesn't allow keys that include dollar sign or period.

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes) //Since id is mentioned here, findById won't be accessible inside reviews.js file. To make that accessible from here , we have to use merge paarams since router params are different from these express app params


app.get('/',(req,res)=>{
    res.render('home');
})

app.all('*',(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
})
app.use((err,req,res,next)=>{
    const {status = 500} = err;
    if(!err.message){
        err.message = "Oh No, Something went wrong!"
    }
    res.status(status).render('error',{err});
    //next(err);
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Listening on Port ${port}`);
})