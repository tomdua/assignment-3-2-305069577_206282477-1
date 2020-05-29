var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");

router.use(function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM dbo.users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
        }
        next();
      })
      .catch((error) => next(error));
  } else {
    next();
  }
});


router.use(function requireLogin(req, res, next) {
  if (!req.user_id) {
    next({ status: 401, message: "unauthorized" });
  } else {
    next();
  }
});



//----------------------/////////////////////////////////////////////----------////////////
router.get("/recipeInfo/{ids}", async (req, res, next) => {
  try {
    const familyRecipse = (
      await DButils.execQuery(
        `SELECT * FROM dbo.family_recipes df LEFT JOIN dbo.recipes_ingredients ri ON df.user_id = '${req.user_id}'
        and ri.user_id='${req.user_id}'`));
    res.send(familyRecipse);
  } catch (error) {
    next(error);
  }
});







router.post("/familyRecipes", async (req, res, next) => {
  try {
    const recipeIngre = req.body.ingredients;
    //const recipeIngrename=Object.keys(recipeIngre[0]);
    await DButils.execQuery(
      `INSERT INTO dbo.family_recipes VALUES (default,'${req.user_id}','${req.body.recipe_name}','${req.body.recipe_owner}','${req.body.event}','${req.body.instructions}');`
    );
  await (
    recipeIngre.forEach(x => {
      DButils.execQuery(
        `INSERT INTO dbo.recipes_ingredients VALUES ('${req.user_id}','${req.body.recipe_name}','${Object.keys(x)}','${Object.values(x)}');`
      );
    })
    );
  

    res.send({ sucess: true});
  } catch (error) {
    next(error);
  }
});


router.get("/familyRecipes", async (req, res, next) => {
  try {
    const familyRecipse = (
      await DButils.execQuery(
        `SELECT * FROM dbo.family_recipes df LEFT JOIN dbo.recipes_ingredients ri ON df.user_id = '${req.user_id}'
        and ri.user_id='${req.user_id}'`));
    res.send(familyRecipse);
  } catch (error) {
    next(error);
  }
});


router.get("/personalRecipes", function (req, res) {
  res.send(req.originalUrl);
});


router.post("/personalRecipe", async (req, res, next) => {
  try {
    await DButils.execQuery(
      `INSERT INTO dbo.recipes VALUES ('${req.user_id}', '${req.body.recipe_name}')`
    );
    res.send({ sucess: true, cookie_valid: req.username && 1 });
  } catch (error) {
    next(error);
  }
});


router.get("/favoriteRecipes", function (req, res) {
  res.send(req.originalUrl);
});



router.post("/favoriteRecipes", async (req, res, next) => {
  try {
    await DButils.execQuery(
      `INSERT INTO dbo.recipes VALUES ('${req.user_id}', '${req.body.recipe_name}')`
    );
    res.send({ sucess: true, cookie_valid: req.username && 1 });
  } catch (error) {
    next(error);
  }
});


router.get("/watchedRecipes", function (req, res) {
  res.send(req.originalUrl);
});



router.post("/watchedRecipes", async (req, res, next) => {
  try {
    await DButils.execQuery(
      `INSERT INTO dbo.recipes VALUES ('${req.user_id}', '${req.body.recipe_name}')`
    );
    res.send({ sucess: true, cookie_valid: req.username && 1 });
  } catch (error) {
    next(error);
  }
});







module.exports = router;
