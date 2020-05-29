var express = require("express");
var router = express.Router();
const axios = require("axios");

const api_domain = "https://api.spoonacular.com/recipes";

router.get("/information", async (req, res, next) => {
  try {
    const recipe = await getRecipeInfo(req.query.recipe_id);
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
      getRecipeInfo(recipe_raw.id)
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
        veryPopular: recipe.veryPopular
    }
  })
  res.send({ u_recipes });
  } catch (error) {
    next(error);
  }
});


function getRecipeInfo(id) {
  return axios.get(`${api_domain}/${id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey
    }
  });
}

module.exports = router;
