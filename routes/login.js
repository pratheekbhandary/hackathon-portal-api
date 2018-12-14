const crypto = require("crypto");
const express = require("express");
const { Idea } = require("../models/idea");

const loginRouter = express.Router();

function tokenParser(req, res, next) {
  const pattern = /^Basic (.+)$/;
  const auth = req.header("Authorization");
  if (pattern.test(auth)) {
    const [, token] = auth.match(pattern);
    const hash = crypto.createHash("sha256");
    hash.update(token);
    req.authToken = hash.digest("hex");
    next();
  } else {
    res.sendStatus(401);
  }
}

loginRouter.post("/login", tokenParser, (req, res) => {
  const { username } = req.body;
  const token = req.authToken;
  req.dbClient.findIdea({ teamMembers: username }).then(
    idea => {
      if (!idea) {
        const newIdea = Idea.create(username, token);
        req.dbClient.insertIdea(newIdea).then(result => {
          res.cookie("AuthToken", token, {
            httpOnly: true,
            maxAge: 900000
          });
          res.send({
            name: ""
          });
        });
      } else {
        const { author } = idea;
        if (author.email !== username) {
          res.status(400).send({
            author: author.email,
            team: idea.teamName,
            title: idea.nominationTitle
          });
        } else if (author.token === token) {
          res.cookie("AuthToken", token, {
            httpOnly: true,
            maxAge: 900000
          });
          if (author.firstName && author.lastName) {
            res.send({
              name: `${author.firstName} ${author.lastName}`
            });
          } else {
            res.send({
              name: ""
            });
          }
        } else {
          res.sendStatus(403);
        }
      }
    },
    err => {
      req.logger.error(err);
      res.sendStatus(500);
    }
  );
});

module.exports = { loginRouter };
