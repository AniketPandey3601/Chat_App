// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Secret key for JWT
// const JWT_SECRET_KEY = process.env.JWT_SECRET; // Replace 'your_secret_key' with your actual secret key


// let loggedInUsers = [];
// router.post('', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ where: { email: email } });
//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             return res.status(401).send('Invalid email or password');
//         }

//         // Create a JWT token with user id encrypted
//         const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour

//         // Send the JWT token to the frontend
//         // console.log(token)
//         res.status(200).json({ token: token });
//     } catch (error) {
//         console.error('Error logging in:', error);
//         res.status(500).send('Error logging in. Please try again later.');
//     }
// });

// module.exports = router;


// routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// const loggedInUsers = require('./loggedInUsers'); // Import the loggedInUsers route

// Secret key for JWT
const JWT_SECRET_KEY = process.env.JWT_SECRET;

// Replace 'your_secret_key' with your actual secret key

let loggedInUsers = [];

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

        // Add user to the list of logged-in users
        const alreadyLoggedIn = loggedInUsers.some(u => u.id === user.id);
        if (!alreadyLoggedIn) {
            // Add user to the list of logged-in users
            loggedInUsers.push({ id: user.id, name: user.name });
        }

        // Create a JWT token with user id encrypted
        const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour

        // Send the JWT token to the frontend
        res.status(200).json({ token: token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in. Please try again later.');
    }
});



router.get('/loggedIn', (req, res) => {
    try {
        // Return the list of logged-in users
        res.status(200).json({ users: loggedInUsers });
    } catch (error) {
        console.error('Error fetching logged-in users:', error);
        res.status(500).json({ message: 'Error fetching logged-in users' });
    }
});

module.exports = router;

