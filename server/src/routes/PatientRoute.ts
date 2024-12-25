import express from "express";
import { auth, isPatient } from "../middlewares/auth";
import { updatePatientProfile } from "../controllers/Patient";

const router = express.Router();

router.put("/update-profile", auth, isPatient, updatePatientProfile);