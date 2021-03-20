const express = require("express");
const article = require("./../models/article");
const Article = require("./../models/article");
const router = express.Router();

router.get("/", async (req, res) => {
  const articles = await Article.find().sort({
    createdAt: "desc",
  });
  res.render("articles/all", { articles: articles });
});

router.get("/admin", async (req, res) => {
  if (req.isAuthenticated()) {
    const articles = await Article.find().sort({
      createdAt: "desc",
    });
    res.render("articles/articleAdmin", { articles: articles });
  } else {
    res.redirect("/login");
  }
});

router.get("/new", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("articles/new", { article: new Article() });
  } else {
    res.redirect("/login");
  }
});
router.get("/edit/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const article = await Article.findById(req.params.id);
    res.render("articles/edit", { article: article });
  } else {
    res.redirect("/login");
  }
});
router.get("/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (article == null) res.redirect("/");
  res.render("articles/show", { article: article });
});
router.post("/", async (req, res, next) => {
    req.article = new Article();
    next();
  },
  saveArticleAndRedirect("new")
);

router.put(
  "/:id",
  async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
  },
  saveArticleAndRedirect("edit")
);

router.delete("/:id", async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.redirect("/articles/admin");
});
function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;
    (article.title = req.body.title),
      (article.description = req.body.description),
      (article.imgUrl = req.body.imgUrl),
      (article.markdown = req.body.markdown);
    try {
      article = await article.save();
      res.redirect(`/articles/${article.id}`);
    } catch (e) {
      res.render(`articles/${path}`, { article: article });
    }
  };
}
module.exports = router;
