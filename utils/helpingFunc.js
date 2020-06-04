require("dotenv").config();
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";


  exports.getRecipeInfo = async function (id) {
    return axios.get(`${api_domain}/${id}/information`, {
      params: {
        includeNutrition: false,
        apiKey: process.env.spooncular_apiKey
      }
    });
  };

  exports.getPrevInfo = async function (info){
    return info.map((recipe) => {
      return {
        image: recipe.image,
        title: recipe.title,
        vegetarian: recipe.vegetarian,
        vegan: recipe.vegan,
        glutenFree: recipe.glutenFree,
        likes: recipe.aggregateLikes,
        readyInMinutes: recipe.readyInMinutes
      };
  })
}
  

  exports.getCountries = async function() {
    return axios.get(`https://restcountries.eu/rest/v2/all`, {
      params: {
        //includeNutrition: false,
        //apiKey: process.env.spooncular_apiKey
      }
    });
  };


//- or we can use this:
  //module.exports ={

//}