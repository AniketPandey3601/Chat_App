
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const  User =  require('../models/User');

const signupController = require('../controllers/signupController')

router.post('', signupController.signup);

module.exports = router;
