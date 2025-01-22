import multer from "multer";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //Specifies the folder where uploaded files will be saved (./public/temp in this case).
    cb(null, "./public/temp");
    //The callback cb is used to pass the directory path.
  },

  filename: function (req, file, cb) {
    //Defines how the uploaded files are named. It uses a combination of fieldname and uniqueSuffix to create a unique filename.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

export const upload = multer({ storage: storage })
