const express = require("express");
const router = express.Router();
const fs = require("fs");
const firebase = require("../../config/firebase");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    return callback(null, process.cwd() + "/tmp/");
  },
});

const uploadFileImage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // limit file size 5MB
  },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" 
    ) {
      return callback(null, true);
    } else {
      callback(null, false);
      return {
        message: "Only .png, .jpg and .jpeg format allowed!",
      };
    }
  },
});

const uploadFileVideo = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // limit file size 500MB
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype === "video/mp4" || file.mimetype === "video/webm") {
      return callback(null, true);
    } else {
      callback(null, false);
      return {
        message: "Only .mp4 and .webm format allowed!",
      };
    }
  },
});

const uploadFilePDF = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // limit file size 500MB
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype === "application/pdf") {
      return callback(null, true);
    } else {
      callback(false);
      return {
        message: "Only .pdf format allowed!",
      };
    }
  },
});

router.post("/images", uploadFileImage.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file found!" });
    } else {
      await firebase.bucket.upload(req.file.path, {
        metadata: {
          contentType: req.file.mimetype,
        },
        destination: `doubled/images/${req.file.filename}`,
      });
      fs.unlinkSync(req.file.path);
      return res.status(200).json({
        url: `https://storage.googleapis.com/${firebase.bucket.name}/doubled/images/${req.file.filename}`,
        message: "Upload Image Successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/videos", uploadFileVideo.single("video"), async (req, res) => {
  try {
    if (req.file) {
      await firebase.bucket.upload(req.file.path, {
        metadata: {
          contentType: req.file.mimetype,
        },
        destination: `doubled/videos/${req.file.filename}`,
      });
      fs.unlinkSync(req.file.path);
      return res.status(200).json({
        url: `https://storage.googleapis.com/${firebase.bucket.name}/doubled/videos/${req.file.filename}`,
        message: "Upload Video Successfully!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/pdf", uploadFilePDF.single("pdf"), async (req, res) => {
  try {
    if (req.file) {
      await firebase.bucket.upload(req.file.path, {
        metadata: {
          contentType: req.file.mimetype,
        },
        destination: `doubled/files/${req.file.filename}`,
      });
      fs.unlinkSync(req.file.path);
      return res.status(200).json({
        url: `https://storage.googleapis.com/${firebase.bucket.name}/doubled/files/${req.file.filename}`,
        message: "Upload PDF File Successfully!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
