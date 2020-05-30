var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const utils= require("./utils/search_recipe");
const axios = require("axios");
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


router.use(function requireLogin(req, res, next) {
  if (!req.user_id) {
    next({ status: 401, message: "unauthorized" });
  } else {
    next();
  }
});



/////////-----------------------------------------/////////////////////////
// router.get("/recipeInfo/:ids", async (req, res, next) => {
//   try {
//     const {ids} = req.params;
//     const userDetails = (
//       await DButils.execQuery(
//         `SELECT * FROM dbo.users WHERE user_id = '${req.user_id}'`));
//         let recipes = await Promise.all(
//           random_response.data.recipes.map((recipe_raw) =>
//             getRecipeInfo(recipe_raw.id)
//           )
//         );
      
//         recipes = recipes.map((recipe) => recipe.data);
//         const u_recipes = recipes.map((recipe) => {
//           return {
//               id:
//               : recipe.image,
//               title: recipe.title,
//               vegetarian: recipe.vegetarian,
//               vegan: recipe.vegan,
//               glutenFree: recipe.glutenFree,
//               like: recipe.aggregateLikes,
//               readyInMinutes: recipe.readyInMinutes,
//               veryPopular: recipe.veryPopular,
//              // instructions: recipe.instructions
//           }
//         })
//       res.send({ u_recipes });    
//   } catch (error) {
//     next(error);
//   }
// });
/////////-----------------------------------------/////////////////////////







router.post("/familyRecipes", async (req, res, next) => {
  try {
    const recipeIngredients = JSON.stringify(req.body.ingredients);
    //const recipeIngrename=Object.keys(recipeIngre[0]);
    await DButils.execQuery(
      `INSERT INTO dbo.family_recipes VALUES (default,'${req.user_id}','${req.body.recipe_name}','${req.body.recipe_owner}','${req.body.in_event}','${recipeIngredients}','${req.body.instructions}');`
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
        `SELECT * FROM dbo.family_recipes where user_id = '${req.user_id}'`));
    res.send(familyRecipse);
  } catch (error) {
    next(error);
  }
});


router.get("/personalRecipes", async (req, res, next) => {
  try {
    const personalRecipes = (
      await DButils.execQuery(
        `SELECT * FROM dbo.recipes where user_id = '${req.user_id}'`));
    res.send(personalRecipes);
  } catch (error) {
    next(error);
  }
});


router.post("/personalRecipe", async (req, res, next) => {
  try {
    const recipeIngredients = JSON.stringify(req.body.ingredients);
    //const recipeIngrename=Object.keys(recipeIngre[0]);
    await DButils.execQuery(
      `INSERT INTO dbo.recipes VALUES (default,'${req.user_id}','${req.body.recipe_name}','${req.body.image_URL}','${req.body.preparation_time}','${req.body.likes}','${req.body.vegan}','${req.body.glutten_free}','${recipeIngredients}','${req.body.instructions}','${req.body.dishes_number}');`
    );
    res.send({ sucess: true });
  } catch (error) {
    next(error);
  }
});


router.get("/favoriteRecipes",  async (req, res, next)=> {
  try {
    const arr = (
      await DButils.execQuery(
        `SELECT favorite_recipes FROM dbo.users where user_id = '${req.user_id}'`));
    let splited = arr[0];//.favorite_recipse;//.split(",");
    splited=Object.values(splited);
   // splited= JSON.stringify(splited);
    splited= splited[0].split(",");
    splited.pop();
    // let recipes = await Promise.all(
    //   splited.map((recipe_raw) =>
    //     getRecipeInfo(recipe_raw)
    //   )
    // );



    let recipes = await Promise.all( 
    splited.forEach(x => {return 
        getRecipeInfo(x)
  } ));
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});



router.put("/favoriteRecipes", async (req, res, next) => {
  try {
    let newRecipe = req.query.recipe_id;
    let lastRecipes = await DButils.execQuery(
      `SELECT favorite_recipes FROM dbo.users WHERE user_id = '${req.user_id}'`
    );
    let arr = [newRecipe,lastRecipes[0].favorite_recipes];

    await DButils.execQuery(
      `UPDATE dbo.users Set favorite_recipes =CAST('${arr}' AS varchar) WHERE user_id = '${req.user_id}'`
    );
    res.send({ sucess: true });
  } catch (error) {
    next(error);
  }
});


router.get("/watchedRecipes", function (req, res) {
  res.send(req.originalUrl);
});


// function getRecipeInfo(id) {
//   return axios.get(`${api_domain}/${id}/information`, {
//     params: {
//       includeNutrition: false,
//       apiKey: process.env.spooncular_apiKey
//     }
//   });
// }





module.exports = router;
