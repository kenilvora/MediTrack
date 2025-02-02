import express from "express";
import { config } from "dotenv";
import { dbConnect } from "./config/database";
import cors from "cors";
import userRoute from "./routes/UserRoute";

config();

dbConnect();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use("/api/v1/user", userRoute);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is UP and Running...",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
