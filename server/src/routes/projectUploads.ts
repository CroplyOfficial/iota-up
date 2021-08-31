import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';

import { ensureAuthorized } from '../middleware/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}${file.originalname.split('.')[0]}${path.extname(
        file.originalname
      )}`
    );
  },
});

function ensureIsSupported(file: any, cb: any) {
  const fileTypes = /jpg|jpeg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  } else {
    cb('not supported');
  }
}

const upload: any = multer({
  storage,
  fileFilter: function (req, file, cb) {
    ensureIsSupported(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024, fieldSize: 3 * 1024 * 1024 },
});

/**
 * @route POST /api/uploads
 */

router.post(
  '/',
  ensureAuthorized,
  upload.single('media'),
  (req: Request, res: Response) => {
    if (req.file) {
      res.json({
        url: `/uploads/${req.file.filename}`,
      });
    } else {
      res.status(400);
      throw new Error('Bad request');
    }
  }
);

export default router;
