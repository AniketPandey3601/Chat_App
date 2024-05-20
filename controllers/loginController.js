

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');




const JWT_SECRET_KEY = process.env.JWT_SECRET;



let loggedInUsers = [];

exports.login = async (req, res) => {
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


        const alreadyLoggedIn = loggedInUsers.some(u => u.id === user.id);
        if (!alreadyLoggedIn) {

            loggedInUsers.push({ id: user.id, name: user.name });
        }


        const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ token: token, userId: user.id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in. Please try again later.');
    }
};


exports.loginUsers =  (req, res) => {
    try {

        res.status(200).json({ users: loggedInUsers });
    } catch (error) {
        console.error('Error fetching logged-in users:', error);
        res.status(500).json({ message: 'Error fetching logged-in users' });
    }
};
