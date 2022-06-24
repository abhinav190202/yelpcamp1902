const express = require('express');
const router = express.Router({mergeParams : true}); //This is needed as params of router is different to that of express app

const Campground = require('../models/campground');
const Review = require('../models/review')

const catchAsync = require('../utils/catchAsync');

const reviews = require('../controllers/reviews')

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;