import mongoose from "mongoose";

export const dbConnect = async () => {
  await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
      console.log("Connected to Database Successfully");
    })
    .catch((err) => {
      console.log("Error connecting to database", err);
    });
};
