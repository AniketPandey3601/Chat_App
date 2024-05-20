
const express = require('express');
const router = express.Router();
const GroupMessage= require('../models/groupmsg');
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User')
const UserGroup = require('../models/UserGroup');
const chatmsgController = require('../controllers/chatmsgController')


router.post('/:groupId/send', authenticateToken, chatmsgController.sendmessage);


router.get('/:groupId/messages', authenticateToken,chatmsgController.getmessages );

module.exports = router;
