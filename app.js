const express = require('express');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const http = require('http'); 
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// const io = require('socket.io')(http);

const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
require('./messagearchiver')


// app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist'));
const cors = require('cors');

const sequelize = require('./models/index')
const signupRoute = require('./routes/signup')
const loginRoute = require('./routes/login');
const chatRoute = require('./routes/chatMessages');
const groupRoutes = require('./routes/groups')
const messageRoute =require('./routes/chatMessages')
const GroupMessage= require('./models/groupmsg');
const UserGroup = require('./models/UserGroup')
const User = require('./models/User')
const Group = require('./models/Group')
const path  = require('path')
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(express.static('public'));


app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));

});


app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],     
    allowedHeaders: ['Content-Type'], 
    credentials: true             
}));


aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!s3BucketName) {
    throw new Error('S3 bucket name is required');
  }
  

  const s3 = new aws.S3();


  

io.use((socket, next) => {
    const userId = socket.handshake.headers['x-user-id']; 

    console.log("this is",userId)

    if (userId) {
        socket.userId = userId;
        
        console.log(socket.userId)
        
        next();
    } else {
       
        next(new Error('Missing X-user-Id header'));
    }
});


io.on('connection', (socket) => {
    console.log('A user connected');
   
    socket.on('joinRoom', async(room) => {
  
      console.log(`${socket.id} just joined room ${room}`);
  
      socket.join(room);
  
      try {
        const user = await User.findOne({ where: { id: socket.userId } });
        if (user) {
            const username = user.name;
            io.to(room).emit('roomJoined', `${username} joined the group`);
        }
    } catch (error) {
        console.error('Error fetching username:', error);
    }
    });
  
  
    socket.on('leaveRoom', async(room) => {
      console.log(`${socket.id} has left room ${room}`);
  
      socket.leave(room);
      try {
        const user = await User.findOne({ where: { id: socket.userId } });
        if (user) {
            const username = user.name;
            io.to(room).emit('roomLeft', `${username} has left the room`);
        
        }
    } catch (error) {
        console.error('Error fetching username:', error);
    }
    });
  
      
    
  
  
    socket.on('messageToRoom', async (data) => {
        console.log(`${data.userId} posted a message to room ${data.room}: ${data.message}`);
      
        try {
           

            const user = await User.findOne({ where: { id: data.userId} });
            if (user) {
                const username = user.name;
                
                await GroupMessage.create({
                    groupId: data.room,
                    userId: data.userId,
                    message: data.message,
                    
                });
              
                io.to(data.room).emit('message', {
            
                    id: data.userId,
                    username: username,
                    message: data.message
                });
             
            }
        } catch (error) {
            console.error('Error posting message:', error);
        }
    });


  
 
    socket.on('messageToAll', (data) => {
      console.log(`${socket.id} sent a message to all clients: ${data.message}`);
  
      io.emit('message', {
        id: socket.id,
        message: data.message
      });  
  
    });


    socket.on('uploadFile', async (fileData) => {
        try {
          
          
          const fileKey = Date.now().toString() + '-' + fileData.originalname;
      
         
          const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            Body: fileData.buffer, 
             ACL:'public-read',
            ContentType: fileData.mimetype  
          };
      
         
          await s3.upload(params).promise();
      
         
          const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
      
          io.emit('fileUploaded', { fileUrl });
        } catch (error) {
          console.error('Error uploading file to S3:', error);
        }
      });



 
    socket.on('disconnect', () => {
  
      console.log(`${socket.id} disconnected`);
  
    });

  
  });

User.belongsToMany(Group, { through: UserGroup ,foreignKey:'groupId'});
Group.belongsToMany(User, { through: UserGroup ,foreignKey:'userId'});




User.hasMany(GroupMessage,{ foreignKey: 'userId' })
GroupMessage.belongsTo(User, { foreignKey: 'userId' });




Group.hasMany(GroupMessage,{ foreignKey: 'groupId' });
GroupMessage.belongsTo(Group,{ foreignKey: 'groupId' });


GroupMessage.belongsTo(UserGroup,{ foreignKey: 'groupId' }); 
UserGroup.hasMany(GroupMessage,{ foreignKey: 'groupId' });

UserGroup.belongsTo(User); 


app.use(express.static('public'));
app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist'));

app.use('/signup', signupRoute);
app.use('/login', loginRoute);
app.use('/chatMessages',chatRoute)
app.use('/groups', groupRoutes)
app.use('/messages', messageRoute)

sequelize.sync().then(() => {
    server.listen((process.env.PORT || 3000), () => {
       console.log(`Server is running on port 3000`);
     });
   });