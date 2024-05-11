// routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password');
        }

        // Handle successful login, for example, create a session or send a JWT token
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in. Please try again later.');
    }
});

module.exports = router;
