// routes/groups.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');
const authenticateToken = require('../middleware/authenticateToken');

let groups = [];

router.get('/', async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.status(200).json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups. Please try again later.' });
    }
});

// Create a Group
router.post('/', authenticateToken, async (req, res) => {
    const { name } = req.body;

    try {
        const newGroup = await Group.create({ name });
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Error creating group. Please try again later.' });
    }
});



router.post('/:groupId/messages', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const groupId = req.params.groupId;

        // Logic to save the message in the database
        const newMessage = await GroupMessage.create({
            groupId: groupId,
            message: message,
            userId: req.user.userId // Assuming you have authentication middleware to get userId from the request
        });

        res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error('Error sending group message:', error);
        res.status(500).json({ message: 'Error sending group message. Please try again later.' });
    }
});


router.put('/:groupId/members', authenticateToken, async (req, res) => {
    try {
        const { userIds, action } = req.body; // userIds is an array of user IDs
        const groupId = req.params.groupId;

        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Logic to add or remove members from the group
        if (action === 'add') {
            await group.addUsers(userIds);
        } else if (action === 'remove') {
            await group.removeUsers(userIds);
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        res.status(200).json({ message: 'Group members updated successfully' });
    } catch (error) {
        console.error('Error managing group members:', error);
        res.status(500).json({ message: 'Error managing group members. Please try again later.' });
    }
});


router.delete('/:groupId/leave', authenticateToken, async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Logic to remove the user from the group
        await group.removeUser(req.user.userId);

        res.status(200).json({ message: 'Left group successfully' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'Error leaving group. Please try again later.' });
    }
});


module.exports = router;
