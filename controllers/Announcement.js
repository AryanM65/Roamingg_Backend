const Announcement = require("../Models/Announcement");

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetAudience } = req.body;
    console.log("req.user", req.user);
    const announcement = await Announcement.create({
      title,
      message,
      targetAudience,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created",
      announcement,
    });
  } catch (error) {
    console.error("createAnnouncement error:", error);
    res.status(500).json({ success: false, message: "Failed to create announcement" });
  }
};
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role"); // Only populate desired fields

    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("getAllAnnouncements error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch announcements" });
  }
};


// exports.deleteAnnouncement = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Announcement.findByIdAndDelete(id);
//     res.status(200).json({ success: true, message: "Announcement deleted" });
//   } catch (error) {
//     console.error("deleteAnnouncement error:", error);
//     res.status(500).json({ success: false, message: "Failed to delete announcement" });
//   }
// };
