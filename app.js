const express = require('express');
const bodyParser = require('body-parser');


const app = express();
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
app.use(cors({
    origin:'*',
    credentials:true,
  

}))

User.belongsToMany(Group, { through: UserGroup ,foreignKey:'groupId'});
Group.belongsToMany(User, { through: UserGroup ,foreignKey:'userId'});




User.hasMany(GroupMessage,{ foreignKey: 'userId' })
GroupMessage.belongsTo(User, { foreignKey: 'userId' });




Group.hasMany(GroupMessage,{ foreignKey: 'groupId' });
GroupMessage.belongsTo(Group,{ foreignKey: 'groupId' });


GroupMessage.belongsTo(UserGroup,{ foreignKey: 'groupId' }); 
UserGroup.hasMany(GroupMessage,{ foreignKey: 'groupId' });

UserGroup.belongsTo(User); 





app.use('/signup', signupRoute);
app.use('/login', loginRoute);
app.use('/chatMessages',chatRoute)
app.use('/groups', groupRoutes)
app.use('/messages', messageRoute)

sequelize.sync().then(() => {
    app.listen((process.env.PORT || 3000), () => {
       console.log(`Server is running on port 3000`);
     });
   });