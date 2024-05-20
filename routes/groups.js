
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const authenticateToken = require('../middleware/authenticateToken');
const UserGroup = require('../models/UserGroup');
const User = require('../models/User')


router.get('', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

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
        const userId = req.user.userId; 
        
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

     
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
        const { email } = req.body;
        const { groupId } = req.params;

        const isAdmin = await UserGroup.findOne({ where: { userId: req.user.userId, groupId: groupId, isAdmin: true } });
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only the group admin can add members.' });
        }

        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isMember = await UserGroup.findOne({ where: { userId: user.id, groupId: groupId } });
        if (isMember) {
            return res.status(400).json({ message: 'User is already a member of the group.' });
        }

        await UserGroup.create({ userId: user.id, groupId });
        res.status(200).json({ message: 'User added to the group successfully.' });
    } catch (error) {
        console.error('Error adding member to group:', error);
        res.status(500).json({ message: 'Error adding member to group. Please try again later.' });
    }
});

router.delete('/:groupId/leave', authenticateToken, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.userId;
    try {
        
        await UserGroup.destroy({ where: { userId, groupId } });

        console.log('left the group')
        res.status(200).json({ message: 'Left group successfully' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'Error leaving group. Please try again later.' });
    }
});



router.put('/:groupId/promote-admin', authenticateToken, async (req, res) => {
    try {
        const { email } = req.body;
        const { groupId } = req.params;

        const isAdmin = await UserGroup.findOne({ where: { userId: req.user.userId, groupId: groupId, isAdmin: true } });
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only the group admin can promote members to admins.' });
        }

    
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isAlreadyAdmin = await UserGroup.findOne({ where: { userId: user.id, groupId: groupId, isAdmin: true } });
        if (isAlreadyAdmin) {
            return res.status(400).json({ message: 'User is already an admin of the group.' });
        }

        await UserGroup.update({ isAdmin: true }, { where: { userId: user.id, groupId } });
        res.status(200).json({ message: 'User promoted to admin in the group successfully.' });
    } catch (error) {
        console.error('Error promoting member to admin:', error);
        res.status(500).json({ message: 'Error promoting member to admin. Please try again later.' });
    }
});



router.delete('/:groupId/remove-member/:email', authenticateToken, async (req, res) => {
    try {
        const { email } = req.params;
        const { groupId } = req.params;

        const isAdmin = await UserGroup.findOne({ where: { userId: req.user.userId, groupId: groupId, isAdmin: true } });
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only the group admin can remove members.' });
        }

        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await UserGroup.destroy({ where: { userId: user.id, groupId } });
        res.status(200).json({ message: 'User removed from the group successfully.' });
    } catch (error) {
        console.error('Error removing member from group:', error);
        res.status(500).json({ message: 'Error removing member from group. Please try again later.' });
    }
});

module.exports = router;
