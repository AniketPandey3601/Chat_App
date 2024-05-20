const cron = require('cron');
const GroupMessage = require('./models/groupmsg');
const ArchivedGroupMessage = require('./models/archivedmsg');
const { Op } = require('sequelize');


const job = new cron.CronJob('0 0 * * *', async () => {
    try {

        console.log("job started")
       
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const oldMessages = await GroupMessage.findAll({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo
                }
            }
        });

       
        await Promise.all(oldMessages.map(async (message) => {
            try {
                
                await ArchivedGroupMessage.create({
                    message: message.message,

                    userId: message.userId,
                    groupId: message.groupId,
                    
                });
            } catch (error) {
                console.error('Error archiving message:', error);
            }
        }));

      
        await GroupMessage.destroy({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo
                }
            }
        });

        console.log('Old messages archived and deleted successfully.');
    } catch (error) {
        console.error('Error archiving old messages:', error);
    }
}, null, true, 'UTC');

job.start();
