import UserModel from "../models/userModels.js";

export const getUserData = async (req, res) => {
  try {
    const  { userId }  = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      userData: {
        name: user.name,
        isVerified:  user.isVerified,
        
      }
    });
    // return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
