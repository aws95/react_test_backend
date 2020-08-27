const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const Product = require("./models/Product");
const Cart = require("./models/Cart");
const cors = require("cors");
const fetch = require("node-fetch");
const redis = require("redis");

//Create Redis client on Redis port
const redisClient = redis.createClient();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// Mongo URI
const mongoURI =
  "mongodb+srv://oussema:react123@cluster0.bvzbp.mongodb.net/react?retryWrites=true&w=majority";
const promise = mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const conn = mongoose.connection;

// Init gfs
let gfs;
conn.once("open", () => {
  // Init stream
  gfs = new Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  console.log("connection made successfully");
});

// Create storage engine
const storage = new GridFsStorage({
  db: promise,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get("/", (req, res) => {
  res.render("index");
});

// @route POST /upload
// @desc  Uploads file to DB
app.post("/upload", upload.single("file"), async (req, res) => {
  const product = new Product({
    product: req.body.product,
    price: req.body.price,
    qty: req.body.qty,
    sizes: req.body.sizes,
    stock: req.body.stock,
    img: req.file.filename,
  });
  try {
    let savedProduct = await product;
    savedProduct.save();
    res.json(savedProduct);
  } catch (err) {
    res.json({ message: err });
  }
});

//@route GET /files
// @desc  Display all files in JSON
app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }
    redisClient.setex(
      req.params,
      3600,
      JSON.stringify({ source: "Redis Cache", ...responseJSON })
    );
    // Files exist
    return res.json(files);
  });
});

// @route GET /image/:filename
// @desc Display Image
app.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }

    // Check if image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
      redisClient.setex(
        req.params,
        3600,
        JSON.stringify({ source: "Redis Cache", ...responseJSON })
      );
    } else {
      res.status(404).json({
        err: "Not an image",
      });
    }
  });
});

// @route GET /products/
app.get("/products", async (req, res) => {
  try {
    redisClient.setex(
      req.params,
      3600,
      JSON.stringify({ source: "Redis Cache", ...responseJSON })
    );
    let products = await Product.find();
    res.json(products);
  } catch (err) {
    res.json({ message: err });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    redisClient.setex(
      req.params,
      3600,
      JSON.stringify({ source: "Redis Cache", ...responseJSON })
    );
    let product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.json({ message: err });
  }
});
const port = 7000;

app.listen(port, () => console.log(`Server started on port ${port}`));
