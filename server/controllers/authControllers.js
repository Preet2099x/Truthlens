import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModels.js";
import transporter from "../config/nodemailer.js";


export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if(!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // sending welcome email
    const mailOptions ={
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to Our App!',
      text: `Hello ${email},\n\nThank you for registering at our app. We're excited to have you on board!\n\nBest regards,\nThe Team`
    }

    await transporter.sendMail(mailOptions);
    return res.status(201).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// users login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and Password are required" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return res.status(200).json({ success: true, data: { user, token } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// log out
export const logout = async (req, res) => {

  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
    });
    return res.json({ success: true, message: "Logged out successfully" });
   
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
  res.clearCookie('token');
  return res.json({ success: true, message: "Logged out successfully" });
};


//  send verification otp to the user's email
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    // const userId = req.userId;


    const user = await UserModel.findById(userId);
    if (!user) {
  return res.status(404).json({ success: false, message: "User not found" });
}
if (user.isVerified) {
  return res.status(400).json({ success: false, message: "User already verified" });
}

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Generate OTP
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send OTP email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Verify Your Email',
      text: `Your verification code is ${otp}. verify your account using this otp.`
    };

    await transporter.sendMail(mailOption);

    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// verify email
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });

    }
    // Mark email as verified
    user.isVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// check if user is authenticated
export const isAuthenticated = async(req, res) =>{
  try{
    return res.status(200).json({ success: true, message: "User is authenticated" });

  } catch(error){
    return res.status(500).json({ success: false, message: error.message });
  }

}

// send password reset otp
export const sendResetOtp = async (req, res) =>{
   const {email} = req.body;

   if(!email){
    return res.json({success: false, message: 'Email is required'})
   }
   try{

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Reset Your Password',
      text: `Your password reset code is ${otp}. Use this code to reset your password.`
    };

    await transporter.sendMail(mailOption);

    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// reset user password
export const resetPassword = async (req, res) =>{
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === '' || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }
     const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Reset password
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}