require("dotenv").config();
let mongoose = require("mongoose");
const express = require("express");
let bodyParser = require("body-parser");
const dns = require("node:dns");

//MONGOOSE METHODS

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("mongoose state: ", mongoose.connection.readyState);
  });

const shortUrlSchema = new mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
});
const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

const cors = require("cors");
const { hostname } = require("node:os");
const app = express();

const createAndSaveUrl = (urlReq, done) => {
  let newUrl = new ShortUrl({ original_url: urlReq });
  newUrl.save(function (err, data) {
    if (err) done(err);
    done(null, data);
  });
};

const findUrlByUrl = (url, done) => {
  console.log("finding url...");
  ShortUrl.findOne({ original_url: url }, function (err, data) {
    if (err) done(err);
    done(null, data);
  });
};
const findUrlById = (id, done) => {};

// Basic Configuration

const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//EXPRESS METHODS

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
  // VALID URL MIDDLEWARE
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
  // VALID HOSTNAME LOOKUP
  function (req, res, next) {
    let urlReq = req.body["url"];
    const REPLACE_REGEX = /^https?:\/\//i;
    let hostname = urlReq.replace(REPLACE_REGEX, "");

    dns.lookup(hostname, (err, addr) => {
      if (err) {
        console.log(err);
        res.json({
          error: "Invalid Hostname",
        });
      } else next();
    });
  },
  //FIND EXISTING URL MIDDLWARE
  function (req, res, next) {
    findUrlByUrl(req.body["url"], (err, data) => {
      if (err) {
        console.log(err);
        res.json({ err: err });
      } else {
        if (!data) next();
        res.json({
          original_url: data.original_url,
          short_url: data._id,
        });
      }
    });
  },

  (req, res, next) => {
    createAndSaveUrl(req.body["url"], (err, data) => {
      if (err) {
        res.json({ err: err });
      } else {
        res.json({
          original_url: data.original_url,
          short_url: data._id,
        });
      }
    });
  }
);

let validUrl = (urlReq) => {
  const regexp = new RegExp("^https?://www..*.com$");
  return regexp.test(urlReq);
};

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
