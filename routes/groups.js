// // routes/groups.js

// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Group = require('../models/Group');
// const Message = require('../models/Message');
// const authenticateToken = require('../middleware/authenticateToken');

// let groups = [];

// router.get('/', async (req, res) => {
//     try {
//         const groups = await Group.findAll();
//         res.status(200).json({ groups });
//     } catch (error) {
//         console.error('Error fetching groups:', error);
//         res.status(500).json({ message: 'Error fetching groups. Please try again later.' });
//     }
// });

// // Create a Group
// router.post('/', authenticateToken, async (req, res) => {
//     const { name } = req.body;

//     try {
//         const newGroup = await Group.create({ name });
//         res.status(201).json({ message: 'Group created successfully', group: newGroup });
//     } catch (error) {
//         console.error('Error creating group:', error);
//         res.status(500).json({ message: 'Error creating group. Please try again later.' });
//     }
// });



// router.post('/:groupId/messages', authenticateToken, async (req, res) => {
//     try {
//         const { message } = req.body;
//         const groupId = req.params.groupId;

//         // Logic to save the message in the database
//         const newMessage = await GroupMessage.create({
//             groupId: groupId,
//             message: message,
//             userId: req.user.userId // Assuming you have authentication middleware to get userId from the request
//         });

//         res.status(201).json({ message: 'Message sent successfully', newMessage });
//     } catch (error) {
//         console.error('Error sending group message:', error);
//         res.status(500).json({ message: 'Error sending group message. Please try again later.' });
//     }
// });


// router.put('/:groupId/members', authenticateToken, async (req, res) => {
//     try {
//         const { userIds, action } = req.body; // userIds is an array of user IDs
//         const groupId = req.params.groupId;

//         const group = await Group.findByPk(groupId);
//         if (!group) {
//             return res.status(404).json({ message: 'Group not found' });
//         }

//         // Logic to add or remove members from the group
//         if (action === 'add') {
//             await group.addUsers(userIds);
//         } else if (action === 'remove') {
//             await group.removeUsers(userIds);
//         } else {
//             return res.status(400).json({ message: 'Invalid action' });
//         }

//         res.status(200).json({ message: 'Group members updated successfully' });
//     } catch (error) {
//         console.error('Error managing group members:', error);
//         res.status(500).json({ message: 'Error managing group members. Please try again later.' });
//     }
// });


// router.delete('/:groupId/leave', authenticateToken, async (req, res) => {
//     try {
//         const groupId = req.params.groupId;

//         const group = await Group.findByPk(groupId);
//         if (!group) {
//             return res.status(404).json({ message: 'Group not found' });
//         }

//         // Logic to remove the user from the group
//         await group.removeUser(req.user.userId);

//         res.status(200).json({ message: 'Left group successfully' });
//     } catch (error) {
//         console.error('Error leaving group:', error);
//         res.status(500).json({ message: 'Error leaving group. Please try again later.' });
//     }
// });


// module.exports = router;



const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const authenticateToken = require('../middleware/authenticateToken');
const UserGroup = require('../models/UserGroup');
const User = require('../models/User')
// Get all groups for the authenticated user
router.get('', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch only the groups that the user is a member of
        const userGroups = await UserGroup.findAll({
            where: { userId: userId }
        });

        const groupIds = userGroups.map(userGroup => userGroup.groupId);

        const groups = await Group.findAll({
            where: { id: groupIds },
            
        });

        res.status(200).json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups. Please try again later.' });
    }
});
// Create a new group
router.post('', authenticateToken, async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId;
    try {
        console.log(req.user.userId)
        const newGroup = await Group.create({ name});
        
        await UserGroup.create({  userId, groupId: newGroup.id, isAdmin: true });
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Error creating group. Please try again later.' });
    }
});






router.get('/:groupId', authenticateToken, async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.user.userId; // Assuming you have the userId from authentication middleware

        // Fetch group details
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Fetch members of the group along with their user IDs
        const userGroups = await UserGroup.findAll({
            where: { groupId: groupId }
        });
        if (!userGroups || userGroups.length === 0) {
            return res.status(200).json({
                group: {
                    name: group.name,
                    members: []
                }
            });
        }

        // Extract member names and user IDs
        const members = [];
        for (const userGroup of userGroups) {
            const user = await User.findByPk(userGroup.userId);
            if (user) {
                members.push({ name: user.name, id: user.id });
            }
        }

        res.status(200).json({ 
            group: { 
                name: group.name, 
                members: members 
            } 
        });
    } catch (error) {
        console.error('Error fetching group info:', error);
        res.status(500).json({ message: 'Error fetching group info. Please try again later.' });
    }
});



// Add a user to a group
// router.put('/:groupId/members', authenticateToken, async (req, res) => {
//     const { userId } = req.body;
//     const groupId = req.params.groupId;
//     try {
//         await UserGroup.create({ userId, groupId });
//         res.status(200).json({ message: 'User added to the group successfully' });
//     } catch (error) {
//         console.error('Error adding user to group:', error);
//         res.status(500).json({ message: 'Error adding user to group. Please try again later.' });
//     }
// });



router.put('/:groupId/add-member', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const { groupId } = req.params;

        // Check if the current user is the admin of the group
        const isAdmin = await UserGroup.findOne({ where: { userId: req.user.userId, groupId: groupId, isAdmin: true } });
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only the group admin can add members.' });
        }

        // Add the user to the group
        await UserGroup.create({ userId, groupId });
        res.status(200).json({ message: 'User added to the group successfully.' });
    } catch (error) {
        console.error('Error adding member to group:', error);
        res.status(500).json({ message: 'Error adding member to group. Please try again later.' });
    }
});


// Leave a group
router.delete('/:groupId/leave', authenticateToken, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.userId;
    try {
        // Remove the user from the group
        await UserGroup.destroy({ where: { userId, groupId } });

        // Return success response
        console.log('left the group')
        res.status(200).json({ message: 'Left group successfully' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'Error leaving group. Please try again later.' });
    }
});



router.put('/:groupId/promote-admin', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const { groupId } = req.params;

        // Check if the current user is the admin of the group
        const isAdmin = await UserGroup.findOne({ where: { userId: req.user.userId, groupId: groupId, isAdmin: true } });
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only the group admin can promote members to admins.' });
        }

        // Update the user's role to admin in the group
        await UserGroup.update({ isAdmin: true }, { where: { userId, groupId } });
        res.status(200).json({ message: 'User promoted to admin in the group successfully.' });
    } catch (error) {
        console.error('Error promoting member to admin:', error);
        res.status(500).json({ message: 'Error promoting member to admin. Please try again later.' });
    }
});



router.delete('/:groupId/remove-member/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { groupId } = req.params;

        // Check if the current user is the admin of the group
        const isAdmin = await UserGroup.findOne({ where: { userId: req.user.userId, groupId: groupId, isAdmin: true } });
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only the group admin can remove members.' });
        }

        // Remove the user from the group
        await UserGroup.destroy({ where: { userId, groupId } });
        res.status(200).json({ message: 'User removed from the group successfully.' });
    } catch (error) {
        console.error('Error removing member from group:', error);
        res.status(500).json({ message: 'Error removing member from group. Please try again later.' });
    }
});

module.exports = router;
