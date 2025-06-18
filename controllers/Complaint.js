const Complaint = require("../Models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    const { listing, subject, message } = req.body;

    const complaint = await Complaint.create({
      user: req.user._id,
      listing,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted",
      complaint,
    });
  } catch (error) {
    console.error("createComplaint error:", error);
    res.status(500).json({ success: false, message: "Failed to create complaint" });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")
      .populate("listing", "title location")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, complaints });
  } catch (error) {
    console.error("getAllComplaints error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch complaints" });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Complaint status updated",
      complaint,
    });
  } catch (error) {
    console.error("updateComplaintStatus error:", error);
    res.status(500).json({ success: false, message: "Failed to update complaint status" });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await Complaint.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Complaint deleted" });
  } catch (error) {
    console.error("deleteComplaint error:", error);
    res.status(500).json({ success: false, message: "Failed to delete complaint" });
  }
};
