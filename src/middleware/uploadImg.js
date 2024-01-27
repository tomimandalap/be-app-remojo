import multer from "multer";
import path from "path";
import message from "../utils/message.js";

const Storage = multer.memoryStorage();

const Upload = multer({
  storage: Storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname.toLowerCase());

    const listAllowExt = [".jpg", ".jpeg", ".png"];

    if (!listAllowExt.includes(ext)) {
      cb(
        {
          name: "MulterError",
          message: "Extention image must be jpg/jpeg/png",
          code: "WRONG_EXT_FILE",
          filed: file.fieldname,
        },
        false
      );
    }

    cb(null, true);
  },
});

export default function UploadImg(req, res, next) {
  const upload = Upload.single("image");

  upload(req, res, (error) => {
    if (error) {
      const { code, message: msg } = error;

      const isLargeSizeFile = code === "LIMIT_FILE_SIZE";
      const isWrongExtFile = code === "WRONG_EXT_FILE";

      const codeRes = isLargeSizeFile ? 413 : isWrongExtFile ? 400 : 500;

      return message(res, codeRes, "Error multer", {
        errors: [
          {
            path: code,
            message: msg,
          },
        ],
      });
    }

    next();
  });
}
