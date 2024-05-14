// // routes/chatMessages.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User')
// const messages = require('../models/messages');
// const  authenticateToken  = require('../middleware/authenticateToken');

// // Route to store a chat message in the database
// router.post('/sendMessage', authenticateToken, async (req, res) => {
    
//     const { message } = req.body;
//     console.log(message)
//     const userId = req.user.userId;
//     // console.log(req);

//     try {
//         // Create a new chat message record in the database
//         const newMessage = await messages.create({
//             userId: userId,
//             message: message
//         });

//         // Send a success response
//         res.status(201).json({ message: 'Message sent successfully', newMessage });
//     } catch (error) {
//         console.error('Error storing chat message:', error);
//         res.status(500).json({ message: 'Error storing chat message. Please try again later.' });
//     }
// });


// router.get('/getAllMessages', authenticateToken, async (req, res) => {
//     try {
        

//         const allMessages = await messages.findAll({ include: User });

        
//         res.status(200).json({ messages: allMessages });
//     } catch (error) {
//         console.error('Error fetching chat messages:', error);
//         res.status(500).json({ message: 'Error fetching chat messages. Please try again later.' });
//     }
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const GroupMessage= require('../models/groupmsg');
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User')
const UserGroup = require('../models/UserGroup');

// Send a message to a specific group
router.post('/:groupId/send', authenticateToken, async (req, res) => {
    
    const { message } = req.body;
    const groupId = req.params.groupId;
    try {
        const newMessage = await GroupMessage.create({
            groupId: groupId,
            message: message,
            userId: req.user.userId
        });
        res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message. Please try again later.' });
    }
});

// Get all messages for a specific group
router.get('/:groupId', authenticateToken, async (req, res) => {
    const groupId = req.params.groupId;

    try {
        const messages = await GroupMessage.findAll({
            where: { groupId: groupId },
            include: [
                { model: User }, // Include associated users
                { model: UserGroup
                 } // Include associated user groups
            ]
        });

        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages. Please try again later.' });
    }
});

module.exports = router;
