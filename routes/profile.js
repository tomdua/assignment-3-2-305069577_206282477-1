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








router.post("/family_recipe", async (req, res, next) => {
  try {
    await DButils.execQuery(
      `INSERT INTO dbo.familyRecipes VALUES ('${req.body.recipeName}','${req.body.img}','${req.body.recipeOwner}', '${req.body.eventTime}', '${req.body.instructions}')`
      `INSERT INTO dbo.recipesIngredients VALUES ('${req.body.ingredientsName}','${req.body.amount}')`
    );
    res.send({ sucess: true, cookie_valid: req.username && 1 });
  } catch (error) {
    next(error);
  }
});


router.get("/family_recipe", async (req, res, next) => {
  try {
    const familyRecipse = (
      await DButils.execQuery(
        `SELECT * FROM dbo.familyRecipes WHERE user_id = '${req.user_id}'`
        ));
    res.send(familyRecipse);
  } catch (error) {
    next(error);
  }
});


router.get("/personal_recipes", function (req, res) {
  res.send(req.originalUrl);
});

router.post("/personal_recipe", async (req, res, next) => {
  try {
    await DButils.execQuery(
      `INSERT INTO dbo.recipes VALUES ('${req.user_id}', '${req.body.recipe_name}')`
    );
    res.send({ sucess: true, cookie_valid: req.username && 1 });
  } catch (error) {
    next(error);
  }
});


router.get("/favorites", function (req, res) {
  res.send(req.originalUrl);
});



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
        readyInMinutes: recipe.readyInMinutes,
        veryPopular: recipe.veryPopular
        
      }
    })
    res.send({ u_recipes });
  } catch (error) {
    next(error);
  }
});



//#region global simple
// router.use((req, res, next) => {
//   const { cookie } = req.body;

//   if (cookie && cookie.valid) {
//     DButils.execQuery("SELECT username FROM dbo.users")
//       .then((users) => {
//         if (users.find((e) => e.username === cookie.username))
//           req.username = cookie.username;
//         next();
//       })
//       .catch((err) => next(err));
//   } else {
//     next();
//   }
// });
//#endregion





//#region example2 - make add Recipe endpoint

//#region complex
// router.use("/addPersonalRecipe", function (req, res, next) {
//   if (req.session && req.session.user_id) {
//     // or findOne Stored Procedure
//     DButils.execQuery("SELECT user_id FROM dbo.users").then((users) => {
//       if (users.find((x) => x.user_id === req.session.user_id)) {
//         req.user_id = user_id;
//         // req.session.user_id = user_id; //refresh the session value
//         // res.locals.user_id = user_id;
//         next();
//       } else throw { status: 401, message: "unauthorized" };
//     });
//   } else {
//     throw { status: 401, message: "unauthorized" };
//   }
// });
//#endregion

//#region simple
// router.use("/addPersonalRecipe", (req, res, next) => {
//   const { cookie } = req.body; // but the request was GET so how come we have req.body???
//   if (cookie && cookie.valid) {
//     req.username = cookie.username;
//     next();
//   } else throw { status: 401, message: "unauthorized" };
// });
//#endregion


//#endregion

module.exports = router;
