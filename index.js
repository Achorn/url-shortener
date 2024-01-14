require("dotenv").config();
let mongoose = require("mongoose");
const express = require("express");
let bodyParser = require("body-parser");
const dns = require("node:dns");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("mongoose state: ", mongoose.connection.readyState);
  });

const shortUrlSchema = new mongoose.Schema({
  url: { type: String, required: true },
});
const ShorenedUrlModel = mongoose.model("ShortUrl", shortUrlSchema);

const cors = require("cors");
const app = express();

const createAndSaveUrl = (url, done) => {};

const findUrlByUrl = (url, done) => {};
const findUrlById = (id, done) => {};

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/shorturl/:short_url", function (req, res) {
  //get shortened url from mongodb
  // if no short url
  // return json
  //  {"error": "No short URL found for the given input"}
  // else redirect to correct url
});

app.post(
  "/api/shorturl",
  function (req, res, next) {
    let urlReq = req.body["url"];
    if (!validUrl(urlReq)) {
      res.json({
        error: "Invalid URL",
      });
    } else {
      next();
    }
  },
  function (req, res, next) {
    let urlReq = req.body["url"];

    dns.lookup(urlReq, (err, addr) => {
      if (err) {
        res.json({
          error: "Invalid Hostname",
        });
      } else next();
    });
  },
  (req, res, next) => {
    console.log("in next function");

    // add to mongo db with url and id?

    // return json with url and id
  }
);

let validUrl = (urlReq) => {
  const regexp = new RegExp("^http://www..*.com$");
  return regexp.test(urlReq);
};

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
