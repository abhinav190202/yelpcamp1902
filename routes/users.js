const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash : true, failureRedirect : '/login'}),users.login);
    //passport.authenticate() checks if the credentials are correct. failureFlash flashes a message if they are incorrect and failureRedirect redirects them to the desired page

router.get('/logout',users.logout);

module.exports = router;