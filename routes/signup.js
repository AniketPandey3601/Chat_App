// routes/signup.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

router.post('/', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

 
    await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    console.log('New user signed up:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    res.send('Signup successful!');
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send('Error signing up. Please try again later.');
  }
});

module.exports = router;
