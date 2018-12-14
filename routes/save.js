const express = require("express");
const multer = require("multer");

const upload = multer({ dest: "submissions/" });

const saveRouter = express.Router();

saveRouter.route("/save").post(upload.single("ideaDocFile"), (req, res) => {
  if (!req.file && !req.body) {
    res.sendStatus(400);
  } else {
    let currentDate = "";
    let status = "SAVED";
    const isSubmitted = req.body.ideaSubmitted === "true" ? true : false;
    if (isSubmitted) {
      currentDate = new Date();
      status = "SUBMITTED";
    }
    req.dbClient
      .updateIdea(
        {
          "author.email": req.authUser,
          "author.token": req.authToken
        },
        {
          $set: {
            teamMembers: req.body.teamMembers,
            teamName: req.body.teamName,
            status: status,
            framework: req.body.framework1,
            nominationTitle: req.body.nominationTitle,
            description: req.body.description,
            ideaDocument: req.file.filename,
            ideaSubmitted: isSubmitted,
            submittedDate: currentDate
          }
        }
      )
      .then(
        response => {
          if (response.result.n === 1) {
            if (isSubmitted) {
              res.send({
                status,
                submittedDate: currentDate.toISOString()
              });
            } else {
              res.send({
                status
              });
            }
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

module.exports = { saveRouter };
