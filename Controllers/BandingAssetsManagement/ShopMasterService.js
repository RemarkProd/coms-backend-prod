const express = require("express");
const pool = require("../../dbConnection");
const router = express.Router();
const Joi = require("joi");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { env } = require("process");

router.get("/", async (req, res, next) => {
  await pool.query(
    "SELECT * FROM shop_master;",

    (error, result) => {
      try {
        if (error) throw error;

        res.status(200).json(result.rows);
      } catch (err) {
        next(err);
      }
    }
  );
});

router.get("/view", async (req, res, next) => {
  await pool.query(
    "SELECT * FROM shop_master_v;",

    (error, result) => {
      try {
        if (error) throw error;

        res.status(200).json(result.rows);
      } catch (err) {
        next(err);
      }
    }
  );
});

router.post("/add", async (req, res, next) => {
  const schema = Joi.object({
    shopName: Joi.string().min(0),
    ownerName: Joi.string().min(0),
    address: Joi.string().min(0),
    divisionId: Joi.number().allow(null),
    districtId: Joi.number().allow(null),
    thanaId: Joi.number().allow(null),
    contactNumber: Joi.string().min(0),
    imagePath: Joi.string().min(0),
    geoLocation: Joi.string().min(0),
    routeId: Joi.number().allow(null),
  });

  const validation = schema.validate(req.body);

  if (validation.error) {
    console.log(validation.error);

    return res.status(400).send("Invalid inputs");
  }

  const {
    shopName,
    ownerName,
    address,
    divisionId,
    districtId,
    thanaId,
    contactNumber,
    imagePath,
    geoLocation,
    routeId,
  } = req.body;

  const date = new Date();

  await pool.query(
    "INSERT INTO public.shop_master(shop_name, owner_name, address, division_id, district_id, thana_id, contact_number, image_path, geo_location, route_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);",
    [
      shopName,
      ownerName,
      address,
      divisionId,
      districtId,
      thanaId,
      contactNumber,
      imagePath,
      geoLocation,
      routeId,
    ],
    (error, result) => {
      try {
        if (error) throw error;

        return res.status(200).json({ message: "Successfully added!" });
      } catch (err) {
        next(err);
      }
    }
  );
});

router.put("/update/:shop_id", async (req, res, next) => {
  const shopId = req.params.shop_id;

  const schema = Joi.object({
    shopName: Joi.string().min(0),
    ownerName: Joi.string().min(0),
    address: Joi.string().min(0),
    divisionId: Joi.number().allow(null),
    districtId: Joi.number().allow(null),
    thanaId: Joi.number().allow(null),
    contactNumber: Joi.string().min(0),
    imagePath: Joi.string().min(0),
    geoLocation: Joi.string().min(0),
    routeId: Joi.number().allow(null),
  });

  const validation = schema.validate(req.body);

  if (validation.error) {
    console.log(validation.error);

    return res.status(400).send("Invalid inputs");
  }

  const {
    shopName,
    ownerName,
    address,
    divisionId,
    districtId,
    thanaId,
    contactNumber,
    imagePath,
    geoLocation,
    routeId,
  } = req.body;

  const date = new Date();

  await pool.query(
    "UPDATE public.shop_master SET shop_name=$1, owner_name=$2, address=$3, division_id=$4, district_id=$5, thana_id=$6, contact_number=$7, image_path=$8, geo_location=$9, route_id=$10 WHERE shop_id=$11;",
    [
      shopName,
      ownerName,
      address,
      divisionId,
      districtId,
      thanaId,
      contactNumber,
      imagePath,
      geoLocation,
      routeId,
      shopId,
    ],
    (error, result) => {
      try {
        if (error) throw error;

        return res.status(200).json({ message: "Successfully updated!" });
      } catch (err) {
        next(err);
      }
    }
  );
});

router.delete("/delete/:shop_id", async (req, res, next) => {
  const shopId = req.params.shop_id;

  await pool.query(
    "DELETE FROM shop_master WHERE shop_id = $1",
    [shopId],
    (error, result) => {
      try {
        if (error) throw error;

        res.status(200).json({ message: "Successfully Deleted" });
      } catch (err) {
        next(err);
      }
    }
  );
});

const imageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, process.env.SHOP_MASTER_PATH));
  },
  filename(req, file, cb) {
    console.log(file);

    cb(null, `shop_master_${file.originalname}`);
  },
});

const imageUpload = multer({ storage: imageStorage });

router.post(
  "/image/upload",
  imageUpload.single("file"),
  async (req, res, next) => {
    const fileInfo = req.file;

    if (fileInfo) {
      try {
        res.status(200).send({
          message: "Uploaded successfully!",
          value: fileInfo.filename,
        });
      } catch (error) {
        console.error(error.message);
        next(error);
      }
    } else {
      res.status(400).send({ message: "File not provided or upload failed!" });
    }
  }
);

router.post("/image/download", (req, res) => {
  const location = process.env.SHOP_MASTER_PATH;
  const filename = req.body.fileName;

  const filePath = path.join(__dirname, location, filename);
  // res.download(`${location}${filename}`, filename);
  res.download(filePath, filename);
});

router.delete("/image/delete", (req, res) => {
  const location = process.env.SHOP_MASTER_PATH;
  const filename = req.body.fileName;

  const filePath = path.join(__dirname, location, filename);

  if (!filePath) {
    return res.status(400).json({ error: "File path is required" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Unable to delete file" });
    }
    res.status(200).json({ message: "File deleted successfully" });
  });
});

module.exports = router;
