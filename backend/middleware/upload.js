import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  },
});

// File validation filter for security
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const allowedMimeTypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtValid = allowedExtensions.test(ext);
  const isMimeValid = allowedMimeTypes.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Upload failed. Only image files (jpg, jpeg, png, webp) are permitted."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB per image file
    files: 3, // max 3 files per upload request
  },
});

export { upload };
