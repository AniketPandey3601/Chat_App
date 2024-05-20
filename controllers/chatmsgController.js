
const express = require('express');
const router = express.Router();
const GroupMessage= require('../models/groupmsg');
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User')
const UserGroup = require('../models/UserGroup');


exports.sendmessage = async (req, res) => {
    
    const { message } = req.body;
    const groupId = req.params.groupId;
    try {
        const newMessage = await GroupMessage.create({
            groupId: groupId,
            message: message,
            userId: req.user.userId
        });
        io.emit('sendMessage', newMessage);
        res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message. Please try again later.' });
    }
}


exports.getmessages = async (req, res) => {
    const groupId = req.params.groupId;

    try {
        const messages = await GroupMessage.findAll({
            where: { groupId: groupId },
            include: [
                { model: User, 
                attributes: ['name'] }, 
                { model: UserGroup
                 } 
            ]
        });

        const messagesWithUsername = messages.map(message => ({
            id: message.id,
              message: message.message,
            userId: message.userId,
            username: message.User ? message.User.name : null, 
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        }));

        res.status(200).json({ messages: messagesWithUsername });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages. Please try again later.' });
    }
}