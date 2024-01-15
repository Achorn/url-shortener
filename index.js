require("dotenv").config();
let mongoose = require("mongoose");
const express = require("express");
let bodyParser = require("body-parser");
const dns = require("dns");
const urlparser = require("url");
//MONGOOSE METHODS

mongoose.connect(process.env.MONGO_URI);

const shortUrlSchema = new mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
});
const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/shorturl/:short_url", function (req, res) {
  ShortUrl.findOne({ _id: req.params.short_url })
    .then((data) => {
      if (!data) {
        res.json({ error: "No short URL found for the given input" });
      } else {
        res.redirect(data.original_url);
      }
    })
    .catch((err) =>
      res.json({ error: "No short URL found for the given input" })
    );
});

app.post(
  "/api/shorturl",
  function (req, res, next) {
    let urlReq = req.body["url"];

    dns.lookup(urlparser.parse(urlReq).hostname, (err, addr) => {
      if (err) {
        res.json({
          error: "Invalid Hostname",
        });
      } else if (!addr) {
        res.json({
          error: "Invalid URL",
        });
      } else next();
    });
  },
  //FIND EXISTING URL MIDDLWARE
  function (req, res, next) {
    ShortUrl.findOne({ original_url: req.body["url"] })
      .then((data) => {
        if (!data) next();
        else
          res.json({
            original_url: data.original_url,
            short_url: data._id,
          });
      })
      .catch((err) => res.json({ err: err }));
  },
  //CREATE  URL
  (req, res) => {
    let newUrl = new ShortUrl({ original_url: req.body["url"] });
    newUrl
      .save()
      .then((data) =>
        res.json({
          original_url: data.original_url,
          short_url: data._id,
        })
      )
      .catch((err) => res.json({ err: err }));
  }
);

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
