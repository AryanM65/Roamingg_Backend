const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
const stripe = require('./routes/stripe');
app.use("/api/v1/stripe", stripe);
app.use(express.json());
const user = require('./routes/user');
const contact = require('./routes/contact');
const booking = require('./routes/booking');
const feedback = require('./routes/feedback');
const listing = require('./routes/listing');
const PORT = process.env.PORT || 4000;

require('./config/database').connect();
require('./config/cloudinary').cloudinaryConnect();

app.use('/api/v1', user, contact, booking, feedback, listing);

app.listen(PORT, () => {
    console.log(`Server live at ${PORT}`);
})
