import { Request, Response, NextFunction } from "express";
import pdfParse from "pdf-parse";
import { parseResumeText } from "../utils/parser";
import { calculateScore, generateBatchReport, ResumeScore } from "../utils/scorer";

export async function uploadResumes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No PDF files were uploaded." });
      return;
    }

    const scores: ResumeScore[] = [];
    const errors: { file: string; reason: string }[] = [];

    for (const file of files) {
      try {
        const data = await pdfParse(file.buffer);
        const parsed = parseResumeText(data.text, file.originalname);
        scores.push(calculateScore(parsed));
      } catch (err) {
        errors.push({
          file: file.originalname,
          reason: err instanceof Error ? err.message : "Unknown parse error",
        });
      }
    }

    if (scores.length === 0) {
      res.status(422).json({
        error: "All uploaded files failed to process.",
        errors,
      });
      return;
    }

    const report = generateBatchReport(scores);

    res.status(200).json({
      ...report,
      ...(errors.length ? { processingErrors: errors } : {}),
    });
  } catch (err) {
    next(err);
  }
}