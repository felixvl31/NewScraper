var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function(app) {
  // A GET route for scraping the echoJS website
  app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios
      .get("https://www.nytimes.com/section/technology")
      .then(function(response) {
        var $ = cheerio.load(response.data);
        $(".css-4jyr1y").each(function(i, element) {
          // Save an empty result object
          var result = {};
          result.title = $(this).children("a").children("h2").text();
          result.link = $(this).children("a").attr("href");
          result.body = $(this).children("a").children("p").text();

          db.News.findOne({ title: result.title })
            .then(function(dbResult) {
              if (dbResult === null) {
                db.News.create(result).then(function(dbNews) {
                });
              }
            })
            .catch(function(err) {
            });
        });
        res.send("Scrape Complete");
      });
  });

  // Route for getting all News
  app.get("/api/news", function(req, res) {
    db.News.find({ saved: false }).sort({ createdAt: -1 }).then(function(dbNews) {
      res.json(dbNews);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for getting saved news
  app.get("/api/saved", function(req, res) {
    db.News.find({ saved: true }).sort({ createdAt: -1 })
      .then(function(dbNews) {
        res.json(dbNews);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for deleting all News
  app.get("/api/delete", function(req, res) {
    db.News.deleteMany({})
      .then(function(dbNews) {
        return db.Note.deleteMany({})
      })
      .then(function(dbNote) {
        res.json(dbNote);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Save a new
  app.put("/api/save/:id", function(req, res) {
    db.News.updateOne({ _id: req.params.id }, { saved: true })
      .then(function(dbNews) {
        res.json(dbNews);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Unsave a new
  app.put("/api/unsave/:id", function(req, res) {
    db.News.updateOne({ _id: req.params.id }, { saved: false })
      .then(function(dbNews) {
        res.json(dbNews);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for grabbing a specific new by id, populate it with notes
  app.get("/api/news/:id", function(req, res) {
    db.News.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbNews) {
        res.json(dbNews);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for saving/updating a note
  app.post("/api/news/:id", function(req, res) {
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.News.findOneAndUpdate({ _id: req.params.id },{ $push: { note: dbNote._id } },{ new: true });
      })
      .then(function(dbNews) {
        res.json(dbNews);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for deleting a note
  app.delete("/api/notedelete/:id", function(req, res) {
    db.Note.deleteOne({ _id: req.params.id })
      .then(function(dbNote) {
        return db.News.findOneAndUpdate({ note: req.params.id },{ $pull:{note:req.params.id}},{ new: true });
      })
      .then(function(dbNews) {
        res.json(dbNews);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
};
