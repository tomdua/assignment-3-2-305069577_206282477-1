var express = require("express");
var router = express.Router();
const axios = require("axios");
const DButils = require("../utils/DButils");
const utils = require("../utils/helpingFunc");
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
    let recipe = await utils.getRecipeInfo(req.query.recipe_id);
    let newRecipe = req.query.recipe_id;

    let lastRecipes = await DButils.execQuery(
      `SELECT watched_recipes FROM dbo.users WHERE user_id = '${req.user_id}'`
    );
    let arr = [newRecipe, lastRecipes[0].watched_recipes];

    await DButils.execQuery(
      `UPDATE dbo.users Set watched_recipes =CAST('${arr}' AS varchar) WHERE user_id = '${req.user_id}'`
    );
    while (recipe.instructions === undefined) {
      recipe = await axios.get(`${api_domain}/random`, {
        params: {
          number: 1,
          apiKey: process.env.spooncular_apiKey,
        },
      });
      recipe = recipe.data.recipes[0];
    }


    const recipesP = await utils.getFullInfo(recipe.data);

    res.send(recipesP);
  } catch (error) {
    next(error);
  }
});

router.get("/random", async (req, res, next) => {
  try {
    const random_response = await axios.get(`${api_domain}/random`, {
      params: {
        number: 3,
        apiKey: process.env.spooncular_apiKey,
      },
    });
    random_response.data.recipes.map(async(recipe) => {
      while (recipe.instructions === undefined) {
        recipe = await axios.get(`${api_domain}/random`,  {
          params: {
            number: 1,
            apiKey: process.env.spooncular_apiKey,
          },
        });
        recipe = recipe.data.recipes[0];
      }
    });

  
    let recipes = random_response.data.recipes; //.map((recipe) => recipe.data);
    const recipesP = await utils.getPrevInfo(recipes);
   
    res.send(recipesP);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
