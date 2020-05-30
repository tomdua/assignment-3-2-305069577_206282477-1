var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const bcrypt = require("bcrypt");
//const { RegisterValidationRules, validate } = require("../modules/validator");


// //const countriesList = document.getElementById("countries");
// let countries; // will contain "fetched" data
// //countriesList.addEventListener("change", newCountrySelection);

// // function newCountrySelection(event) {
// //   displayCountryInfo(event.target.value);
// // }
// fetch("https://restcountries.eu/rest/v2/all")
// .then(res => res.json())
// .then(data => initialize(data))
// .catch(err => console.log("Error:", err));

// function initialize(countriesData) {
//   countries = countriesData;
//   let options = "";
//   countries.forEach(country => options+=`<option value="${country.alpha3Code}">${country.name}</option>`);
//   //countriesList.innerHTML = options; when will be html
//   //countriesList.selectedIndex = Math.floor(Math.random()*countriesList.length);
//  // displayCountryInfo(countriesList[countriesList.selectedIndex].value);
// }


router.post("/register", async (req, res, next) => {
    try {
      // username exists
      const users = await DButils.execQuery("SELECT username FROM dbo.users");
      if (users.find((x) => x.username === req.body.username))
        throw { status: 409, message: "Username taken" };
      // add the new username
      let hash_password = bcrypt.hashSync(
        req.body.password,
        parseInt(process.env.bcrypt_saltRounds)
      );
      await DButils.execQuery(
        `INSERT INTO dbo.users VALUES (default,'${req.body.username}','${hash_password}','${req.body.first_name}','${req.body.last_name}','${req.body.country}','${req.body.email}','${req.body.image_URL}',0,0)`
      );
      res.status(201).send({ message: "user created", success: true });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/login", async (req, res, next) => {
  try {
    // check that username exists
    const users = await DButils.execQuery("SELECT username FROM dbo.users");
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM dbo.users WHERE username = '${req.body.username}'`
      )
    )[0];

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;
    // req.session.save();
    // res.cookie(session_options.cookieName, user.user_id, cookies_options);

    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

// router.post("/Logout", function (req, res) {
//   req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
//   res.send({ success: true, message: "logout succeeded" });
// });

module.exports = router;
