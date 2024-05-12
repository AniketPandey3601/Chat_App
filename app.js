const express = require('express');
const bodyParser = require('body-parser');


const app = express();
const cors = require('cors');

const sequelize = require('./models/index')
const signupRoute = require('./routes/signup')
const loginRoute = require('./routes/login');
const chatRoute = require('./routes/chatMessages');
const messages = require('./models/messages');
const User = require('./models/User')
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(express.static('public'));
app.use(cors({
    origin:'*',
    credentials:true,
  

}))


User.hasMany(messages,{ foreignKey: 'userId' })
messages.belongsTo(User, { foreignKey: 'userId' });




app.use('/signup', signupRoute);
app.use('/login', loginRoute);
app.use('/chatMessages',chatRoute)

sequelize.sync().then(() => {
    app.listen((process.env.PORT || 3000), () => {
       console.log(`Server is running on port 3000`);
     });
   });