var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");

const api_domain = "https://api.spoonacular.com/recipes";


router.get("/search", async (req, res, next) => {
    try {
      const { query, cuisine, diet, intolerances, number } = req.query;
      const search_response = await axios.get(`${api_domain}/search`, {
        params: {
          query: query,
          cuisine: cuisine,
          diet: diet,
          intolerances: intolerances,
          number: number,
          apiKey: process.env.spooncular_apiKey
        }
      });
      let recipes = await Promise.all(
        search_response.data.results.map((recipe_raw) =>
          getRecipeInfo(recipe_raw.id)
        ) 
      );
      recipes = recipes.map((recipe) => recipe.data);
      //#endregion
      const u_recipes = recipes.map((recipe) => {
        return {
          image: recipe.image,
          title: recipe.title,
          vegetarian: recipe.vegetarian,
          vegan: recipe.vegan,
          glutenFree: recipe.glutenFree,
          like: recipe.aggregateLikes,
          readyInMinutes: recipe.readyInMinutes   
        }
      })
      res.send({ u_recipes });
    } catch (error) {
      next(error);
    }
  });



  module.exports = router;
