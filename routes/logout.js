const express = require("express");

const logoutRouter = express.Router();

logoutRouter.get("/logout", (req, res) => {
  res.cookie("AuthToken", req.cookies.AuthToken, {
    httpOnly: true,
    maxAge: 0
  });
  res.sendStatus(200);
});

module.exports = { logoutRouter };
