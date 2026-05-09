import { Router } from "express";
import multer from "multer";
import { uploadResumes } from "./controllers/upload";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Only PDF files are accepted"));
  },
});

router.post("/resumes/upload", upload.array("resumes", 30), uploadResumes);

router.get("/resumes/report", (_req, res) => {
  res.status(200).json({ report: null, message: "No report generated yet" });
});

export default router;