import { Request, Response, NextFunction } from "express";

export const validateShortUrlRequest = (req: Request, res: Response, next: NextFunction) => {
  const { url, validity, shortcode } = req.body;

  try {
    new URL(url); // validate URL
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  if (validity && (!Number.isInteger(validity) || validity <= 0)) {
    return res.status(400).json({ error: "Validity must be a positive integer" });
  }

  if (shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(shortcode)) {
    return res.status(400).json({ error: "Shortcode must be alphanumeric and 3-20 chars long" });
  }

  next();
};
