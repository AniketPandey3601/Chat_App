const express = require('express');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const http = require('http'); 
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// const io = require('socket.io')(http);


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
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(express.static('public'));
// const corsOpts = {
//     origin: '*',
  
//     methods: [
//       'GET',
//       'POST',
//     ],
  
//     allowedHeaders: [
//       'Content-Type',
//     ],
//   };
  
//   app.use(cors(corsOpts));


app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from a specific origin
    methods: ['GET', 'POST'],      // Allow only specific HTTP methods
    allowedHeaders: ['Content-Type'], // Allow only specific headers
    credentials: true              // Allow credentials (e.g., cookies)
}));

io.use((socket, next) => {
    const userId = socket.handshake.headers['x-user-id']; // Retrieve user ID from headers

    console.log("this is",userId)
    if (userId) {
        socket.userId = userId;
        
        console.log(socket.userId)
        
        // Attach user ID to socket object
        next();
    } else {
        // Handle missing user ID header
        next(new Error('Missing X-user-Id header'));
    }
});


io.on('connection', (socket) => {
    console.log('A user connected');
    // Join a room
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
  
    // Leave a room
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
  
      
    
  
  
    // Post a message to a specific room
    socket.on('messageToRoom', async (data) => {
        console.log(`${data.userId} posted a message to room ${data.room}: ${data.message}`);
      
        try {
            // Fetch username from User table

            const user = await User.findOne({ where: { id: data.userId} });
            if (user) {
                const username = user.name;
                // Save message to database
                await GroupMessage.create({
                    groupId: data.room,
                    userId: data.userId,
                    message: data.message,
                     // Save username along with message
                });
                // Emit message to the room
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


  
  
    // Send a message to all connected clients
    socket.on('messageToAll', (data) => {
      console.log(`${socket.id} sent a message to all clients: ${data.message}`);
  
      io.emit('message', {
        id: socket.id,
        message: data.message
      });  
  
    });
    // Disconnect event
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