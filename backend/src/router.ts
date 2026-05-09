import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

// POST /api/resumes/upload — accepts up to 30 PDFs
router.post(
  "/resumes/upload",
  upload.array("resumes", 30),
  (_req: Request, res: Response) => {
    // Phase 2: scoring logic goes here
    res.status(202).json({ message: "Files received", count: (_req.files as Express.Multer.File[])?.length ?? 0 });
  }
);

// GET /api/resumes/report — returns latest batch report
router.get("/resumes/report", (_req: Request, res: Response, _next: NextFunction) => {
  // Phase 2: report retrieval goes here
  res.status(200).json({ report: null, message: "No report generated yet" });
});

export default router;