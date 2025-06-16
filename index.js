const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
app.use(cors({
  origin: process.env.CORS_ORIGIN, // fallback to localhost if env not set
    credentials: true, // allow cookies
    //methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // allowedHeaders: ["Content-Type", "Authorization"],
  // exposedHeaders: ["Set-Cookie"], // expose cookie headers if needed by frontend
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
const user = require('./routes/user');
const contact = require('./routes/contact');
const PORT = process.env.PORT || 4000;

require('./config/database').connect();
require('./config/cloudinary').cloudinaryConnect();

app.use('/api/v1', user, contact);

app.listen(PORT, () => {
    console.log(`Server live at ${PORT}`);
})
