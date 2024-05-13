// routes/chatMessages.js
const express = require('express');
const router = express.Router();
const User = require('../models/User')
const messages = require('../models/messages');
const  authenticateToken  = require('../middleware/authenticateToken');

// Route to store a chat message in the database
router.post('/sendMessage', authenticateToken, async (req, res) => {
    
    const { message } = req.body;
    console.log(message)
    const userId = req.user.userId;
    // console.log(req);

    try {
        // Create a new chat message record in the database
        const newMessage = await messages.create({
            userId: userId,
            message: message
        });

        // Send a success response
        res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error('Error storing chat message:', error);
        res.status(500).json({ message: 'Error storing chat message. Please try again later.' });
    }
});


router.get('/getAllMessages', authenticateToken, async (req, res) => {
    try {
        

        const allMessages = await messages.findAll({ include: User });

        
        res.status(200).json({ messages: allMessages });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ message: 'Error fetching chat messages. Please try again later.' });
    }
});

module.exports = router;
