const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret key for JWT
const JWT_SECRET_KEY = process.env.JWT_SECRET; // Replace 'your_secret_key' with your actual secret key

router.post('', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password');
        }

        // Create a JWT token with user id encrypted
        const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour

        // Send the JWT token to the frontend
        // console.log(token)
        res.status(200).json({ token: token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in. Please try again later.');
    }
});

module.exports = router;
