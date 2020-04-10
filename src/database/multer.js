import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'assets/userImages/');
  },

  filename(req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Image uploaded is not of type jpg/jpeg or png'), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
