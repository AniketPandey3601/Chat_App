
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const  User =  require('../models/User');

router.post('', async (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log(name , email , phone , password);

  try {
    
    const existingUser = await User.findOne({ where: { email: email } });
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

    console.log('Successfully Signed Up');
   
    res.status(200);
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send('Error signing up. Please try again later.');
  }
});

module.exports = router;
