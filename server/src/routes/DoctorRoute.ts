import express from "express";
import { auth, isDoctor } from "../middlewares/auth";
import {
  getAllDoctors,
  getDoctorByAvailability,
  getDoctorById,
  getDoctorBySpecialization,
  getMe,
  updateDoctorProfile,
} from "../controllers/Doctor";

const router = express.Router();

// Route for updating doctor profile
router.put("/update-profile", auth, isDoctor, updateDoctorProfile);

// Route for Get all doctors
router.get("/getAllDoctors", auth, getAllDoctors);

// Route for get doctor by id
router.get("/getDoctor/:id", auth, getDoctorById);

// Route for get me
router.get("/me", auth, isDoctor, getMe);

// Route for get doctor by specialization
router.get(
  "/getDocterBySpecialization/:specialization",
  auth,
  getDoctorBySpecialization
);

// Route for get doctor by availability
router.get(
  "/getDoctorByAvailability/:availability",
  auth,
  getDoctorByAvailability
);

export default router;
