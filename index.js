const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
const fileupload = require('express-fileupload');
const files = require('./routes/fileUpload');
app.use(fileupload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
const user = require('./routes/user');
const PORT = process.env.PORT || 4000;

require('./config/database').connect();
require('./config/cloudinary').cloudinaryConnect();

app.use('/api/v1', user);
app.use('/api/v1/upload', files);

app.listen(PORT, () => {
    console.log(`Server live at ${PORT}`);
})
