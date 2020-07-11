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
    // const response = await this.axios.get(
    //   "http://localhost:3000/profile/recipeInfo/",
    //     {
    //     params: { id: req.query.id }
    //   }
    // );

    //const ids = JSON.parse(req.params.ids);
    let recipeID = req.query.id;
    if (recipeID.length > 10 && req.user_id != undefined) {
      const familyRecipes = await DButils.execQuery(
        `SELECT * FROM dbo.recipes WHERE user_id = '${req.user_id}' and id='${recipeID}' and type='family'`
      );
      const personalRecipes = await DButils.execQuery(
        `SELECT * FROM recipes  WHERE user_id = '${req.user_id}' and id='${recipeID}' and type='personal'`
      );
      if (familyRecipes.length > 0) {
        familyRecipes[0].ingredients = JSON.parse(familyRecipes[0].ingredients);
        familyRecipes[0].analyzedInstructions = JSON.parse(
          familyRecipes[0].analyzedInstructions
        );
        res.send(familyRecipes);
      }
      if (personalRecipes.length > 0) {
        personalRecipes[0].ingredients = JSON.parse(
          personalRecipes[0].ingredients
        );
        personalRecipes[0].analyzedInstructions = JSON.parse(
          personalRecipes[0].analyzedInstructions
        );
        res.send(personalRecipes);
      }
    } else {
      let recipe = await utils.getRecipeInfo(req.query.id);
      let newRecipe = req.query.id;
      if (req.user_id != undefined) {
        let lastRecipes = await DButils.execQuery(
          `SELECT watched_recipes FROM dbo.users WHERE user_id = '${req.user_id}'`
        );
        let arr = [newRecipe, lastRecipes[0].watched_recipes];

        await DButils.execQuery(
          `UPDATE dbo.users Set watched_recipes =CAST('${arr}' AS varchar) WHERE user_id = '${req.user_id}'`
        );
      }

      let recipesP = await utils.getFullInfo(recipe.data);
      // let res = await axios.get(`http://localhost:3000/profile/recipeInfo/${recipesP.id}`);
      const watchedRecipesArr = await DButils.execQuery(
        `SELECT watched_recipes FROM dbo.users WHERE user_id = '${req.user_id}'`
      );
      let splitedWatched = watchedRecipesArr[0]; //.favorite_recipse;//.split(",");
      splitedWatched = Object.values(splitedWatched);
      // splited= JSON.stringify(splited);
      splitedWatched = splitedWatched[0].split(",");
      splitedWatched.pop();
      const favoriteRecipesArr = await DButils.execQuery(
        `SELECT favorite_recipes FROM dbo.users WHERE user_id = '${req.user_id}'`
      );
      let splitedfavorite = favoriteRecipesArr[0]; //.favorite_recipse;//.split(",");
      splitedfavorite = Object.values(splitedfavorite);
      // splited= JSON.stringify(splited);
      splitedfavorite = splitedfavorite[0].split(",");
      splitedfavorite.pop();
      recipeDetails = {
        watched: splitedWatched.includes(recipesP.id.toString()),
        saved: splitedfavorite.includes(recipesP.id.toString()),
      };
      recipesP.saved = recipeDetails.saved;
      recipesP.watched = recipeDetails.watched;
      res.send(recipesP);
    }
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
    random_response.data.recipes.map(async (recipe) => {
      while (recipe.instructions === undefined) {
        recipe = await axios.get(`${api_domain}/random`, {
          params: {
            number: 1,
            apiKey: process.env.spooncular_apiKey,
          },
        });
        recipe = recipe.data.recipes[0];
      }
    });

    let recipes = random_response.data.recipes; //.map((recipe) => recipe.data);
    let recipesP = await utils.getPrevInfo(recipes);
    // let recipesP2 =await recipesP.map(async (recipe) => {
    //   const watchedRecipesArr = await DButils.execQuery(
    //     `SELECT watched_recipes FROM dbo.users WHERE user_id = '${req.user_id}'`
    //   );
    //   let splitedWatched = watchedRecipesArr[0]; //.favorite_recipse;//.split(",");
    //   splitedWatched = Object.values(splitedWatched);
    //   // splited= JSON.stringify(splited);
    //   splitedWatched = splitedWatched[0].split(",");
    //   splitedWatched.pop();
    //   const favoriteRecipesArr = await DButils.execQuery(
    //     `SELECT favorite_recipes FROM dbo.users WHERE user_id = '${req.user_id}'`
    //   );
    //   let splitedfavorite = favoriteRecipesArr[0]; //.favorite_recipse;//.split(",");
    //   splitedfavorite = Object.values(splitedfavorite);
    //   // splited= JSON.stringify(splited);
    //   splitedfavorite = splitedfavorite[0].split(",");
    //   splitedfavorite.pop();
    //   recipeDetails = {
    //     watched: splitedWatched.includes(recipe.id.toString()),
    //     saved: splitedfavorite.includes(recipe.id.toString()),
    //   };
    //   return {
    //     id: recipe.id,
    //     image: recipe.image,
    //     title: recipe.title,
    //     vegetarian: recipe.vegetarian,
    //     vegan: recipe.vegan,
    //     glutenFree: recipe.glutenFree,
    //     aggregateLikes: recipe.aggregateLikes,
    //     readyInMinutes: recipe.readyInMinutes,
    //     watched: recipeDetails.watched,
    //     saved: recipeDetails.saved,
    //   };
    // });
    // console.log(recipesP2);
    res.send(recipesP);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
