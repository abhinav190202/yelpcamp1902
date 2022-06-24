const express = require('express');
const router = express.Router();
//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.
const multer  = require('multer') //Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
const {storage} = require('../cloudinary') //Node automatically looks for a index.js file in a folder
const upload = multer({ storage })


const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds')
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware')

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


 
module.exports = router;