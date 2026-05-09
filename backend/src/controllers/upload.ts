import { Request, Response, NextFunction } from "express";
import pdfParse from "pdf-parse";
import { parseResumeText, ParsedResume } from "../utils/parser";

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

    const results: ParsedResume[] = [];
    const errors: { file: string; reason: string }[] = [];

    for (const file of files) {
      try {
        const data = await pdfParse(file.buffer);
        const parsed = parseResumeText(data.text, file.originalname);
        results.push(parsed);
      } catch (err) {
        // Isolate per-file failures so one bad PDF doesn't kill the batch
        errors.push({
          file: file.originalname,
          reason: err instanceof Error ? err.message : "Unknown parse error",
        });
      }
    }

    res.status(200).json({
      processed: results.length,
      failed: errors.length,
      errors: errors.length ? errors : undefined,
      results,
    });
  } catch (err) {
    next(err);
  }
}