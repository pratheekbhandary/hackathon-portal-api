const express = require("express");

const profileRouter = express.Router();

profileRouter
  .route("/profile")
  .get((req, res) => {
    req.dbClient
      .findIdea({
        "author.email": req.authUser,
        "author.token": req.authToken
      })
      .then(
        idea => {
          if (!idea) {
            res.sendStatus(401);
          } else {
            const { author } = idea;
            res.send({
              firstName: author.firstName,
              lastName: author.lastName,
              mobile: author.mobile,
              email: author.alternate,
              manager: author.manager
            });
          }
        },
        err => {
          req.logger.error(err);
          res.sendStatus(500);
        }
      );
  })
  .post((req, res) => {
    const { author } = req.body;
    if (!author) {
      res.sendStatus(400);
    } else {
      req.dbClient
        .updateIdea(
          {
            "author.email": req.authUser,
            "author.token": req.authToken
          },
          {
            $set: {
              "author.firstName": author.firstName,
              "author.lastName": author.lastName,
              "author.mobile": author.mobile,
              "author.alternate": author.email,
              "author.manager": author.manager
            }
          }
        )
        .then(
          response => {
            if (response.result.n === 1) {
              res.send({ name: `${author.firstName} ${author.lastName}` });
            } else {
              res.sendStatus(400);
            }
          },
          err => {
            req.logger.error(err);
            res.sendStatus(500);
          }
        );
    }
  });

module.exports = { profileRouter };
