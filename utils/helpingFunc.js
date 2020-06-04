require("dotenv").config();
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

exports.getRecipeInfo = async function (id) {
  return axios.get(`${api_domain}/${id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey,
    },
  });
};

exports.getPrevInfo = async function (info) {
  return info.map((recipe) => {
    return {
      image: recipe.image,
      title: recipe.title,
      vegetarian: recipe.vegetarian,
      vegan: recipe.vegan,
      glutenFree: recipe.glutenFree,
      aggregateLikes: recipe.aggregateLikes,
      readyInMinutes: recipe.readyInMinutes,
    };
  });
};

exports.getFullInfo = async function (info) {

 const recipeIngredients = info.extendedIngredients.map((ingredient) => {
 return{
  name: ingredient.name,
  amount: ingredient.amount,
 };
}); 
 return {
    image: info.image,
    title: info.title,
    vegetarian: info.vegetarian,
    vegan: info.vegan,
    glutenFree: info.glutenFree,
    aggregateLikes: info.aggregateLikes,
    readyInMinutes: info.readyInMinutes,
    ingredients: recipeIngredients,
    instructions: info.instructions,
    servings: info.servings,
    // recipeOwner: recipe.data.recipe_owner,
    // inEvent: recipe.in_event
  };
};

exports.getCountries = async function () {
  return axios.get(`https://restcountries.eu/rest/v2/all`, {
    params: {
      //includeNutrition: false,
      //apiKey: process.env.spooncular_apiKey
    },
  });
};

//- or we can use this:
//module.exports ={

//}
