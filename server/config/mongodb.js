// import mongoose from "mongoose";

// const connectDB = async () => {
//   mongoose.connection.on('connected', () => {
//     console.log('MongoDB connected');
//   });
//   await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`);
// };

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connected");
  });

  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;

