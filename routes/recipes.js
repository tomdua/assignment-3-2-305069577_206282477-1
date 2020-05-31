var express = require("express");
var router = express.Router();
const axios = require("axios");
const DButils = require("../utils/DButils");
const utils= require("../utils/search_recipe");
const api_domain = "https://api.spoonacular.com/recipes";


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


router.get("/information", async (req, res, next) => {
  try {
    //const ids = JSON.parse(req.params.ids);
    const recipe = await utils.getRecipeInfo(req.query.recipe_id);
    let newRecipe = req.query.recipe_id;
    
    let lastRecipes = await DButils.execQuery(
      `SELECT watched_recipes FROM dbo.users WHERE user_id = '${req.user_id}'`
    );
    let arr = [newRecipe,lastRecipes[0].watched_recipes];

    await DButils.execQuery(
      `UPDATE dbo.users Set watched_recipes =CAST('${arr}' AS varchar) WHERE user_id = '${req.user_id}'`
    );
    res.send({ data: recipe.data });
  } catch (error) {
    next(error);
  }
});


router.get("/random", async (req, res, next) => {
try{
  const random_response = await axios.get(`${api_domain}/random`, {
    params: {
      number:3,
      apiKey: process.env.spooncular_apiKey
    }
  });
  let recipes = await Promise.all(
    random_response.data.recipes.map((recipe_raw) =>
    utils.getRecipeInfo(recipe_raw.id)
    )
  );

  recipes = recipes.map((recipe) => recipe.data);
  const u_recipes = recipes.map((recipe) => {
    return {
      image: recipe.image,
        title: recipe.title,
        vegetarian: recipe.vegetarian,
        vegan: recipe.vegan,
        glutenFree: recipe.glutenFree,
        like: recipe.aggregateLikes,
        readyInMinutes: recipe.readyInMinutes,
        veryPopular: recipe.veryPopular,
       // instructions: recipe.instructions
    }
  })
  res.send({ u_recipes });
  } catch (error) {
    next(error);
  }
});




module.exports = router;
