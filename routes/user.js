const express = require('express');
const router = express.Router();

const {login, signup, logout, sendOTP, verifyOTP, getFavoriteListings, addToFavorites, viewUserProfile, editUserProfile, removeFromFavourites} = require('../controllers/Auth');
const {auth, isCustomer, isAdmin} = require('../middlewares/auth');
const {upload} = require("../middlewares/multer");

// auth routes 
router.post('/login', login);
router.post("/signup", upload.single("profilePicture"), signup);
router.post("/logout", logout);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get("/get-user-profile", auth, viewUserProfile);
router.put("/edit-profile", auth, upload.single("profilePicture"), editUserProfile);
router.get("/favorites", auth, getFavoriteListings);
router.post("/favorites/add", auth, addToFavorites);
router.delete("/:id/favourite", auth, isCustomer, removeFromFavourites);
module.exports = router;