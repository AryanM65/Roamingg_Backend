const File = require("../Models/File");
const cloudinary = require('cloudinary').v2;
exports.localFileUpload = async (req, res) => {
    try{
        //extract file from req.files.file
        const file = req.files.file;
        console.log(file);

        let path = __dirname + "/files/" + Date.now() + `.${file.name.split('.')[1]}`;
        console.log(path);

        file.mv(path, (error) => {
            console.log(error);
        })

        res.json({
            success: true,
            message: "Local file uploaded Successfully"
        });

    }catch(error){
        console.log(error);
    }
}

function isFileTypeSupported(type, supportedTypes){
    return supportedTypes.includes(type);
}

async function uploadFiletoCloudinary(file, folder, quality){
    const options = {folder};
    console.log("tempfilepath", file.tempFilePath);
    if(quality){
        options.quality = quality;
    }
    options.resource_type = "auto";
    return await cloudinary.uploader.upload(file.tempFilePath, options);
}


//image upload handler
exports.imageUpload = async (req, res) => {
    try{
        const {name, tags, email} = req.body;
        console.log(name, tags, email);
        const file = req.files.imageFile;
        console.log(file);

        //check validation
        const supportedTypes = ["jpg", "jpeg", "png"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log(fileType);
        if(!isFileTypeSupported(fileType, supportedTypes)){
            res.status(400).json({
                success: false,
                message: "File format not supported",
            })
        }

        //when the file format is supported upload to cloudinary
        const response = await uploadFiletoCloudinary(file, "imageFolder")
        console.log(response);
        //save the entry in db

        const fileData = await File.create({
            name,
            tags,
            email,
            imageUrl: response.secure_url,
        })
        
        res.json({
            success: true,
            imageUrl: response.secure_url,
            message: "Image Upload Successful"
        })
        

    }catch(error){
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something Went Wrong",
        })
    }
}

//for video upload handler

exports.videoUpload = async (req, res) => {
    try{
        //data extract 
        const {name, tags, email} = req.body;
        console.log(name, tags, email);
        const file = req.files.videoFile;
        console.log(file);

        //check validation
        const supportedTypes = ["mp4", "mov"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log(fileType);

        //add an upper limit of 5mb for video

        if(!isFileTypeSupported(fileType, supportedTypes)){
            res.status(400).json({
                success: false,
                message: "File format not supported",
            })
        }

        //when file format supported upload to cloudinary
        const response = await uploadFiletoCloudinary(file, "imageFolder")
        console.log(response);

        //upload this file in db / upload the entry in db
        const fileData = await File.create({
            name,
            tags,
            email,
            imageUrl: response.secure_url,
        })
        
        res.json({
            success: true,
            imageUrl: response.secure_url,
            message: "Video Upload Successful"
        })


    }catch(error){
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something Went Wrong",
        })
    }
}

exports.imageSizeReducer = async (req, res) => {
    try{
        const {name, tags, email} = req.body;
        console.log(name, tags, email);
        const file = req.files.imageFile;
        console.log(file);

        //check validation
        const supportedTypes = ["jpg", "jpeg", "png"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log(fileType);

        //TODO: add a upper limit of 5mb 
        if(!isFileTypeSupported(fileType, supportedTypes)){
            res.status(400).json({
                success: false,
                message: "File format not supported",
            })
        }

        //when the file format is supported upload to cloudinary
        //upload by compressing ie changing the quality of the file 
        //TODO: change by changing the height and width 
        const response = await uploadFiletoCloudinary(file, "imageFolder", 30)
        console.log(response);
        //save the entry in db

        const fileData = await File.create({
            name,
            tags,
            email,
            imageUrl: response.secure_url,
        })
        
        res.json({
            success: true,
            imageUrl: response.secure_url,
            message: "Image Upload Successful"
        })

    }catch(error){
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something Went Wrong",
        })
    }
}


