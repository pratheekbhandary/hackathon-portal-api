const express = require("express");
const path = require("path");

const detailsRouter = express.Router();

detailsRouter.get("/template", (req, res) => {
  let filename = "Allstate_Hackathon_Template.pptx";
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Allstate_Hackathon_Template.pptx"
  );
  req.dbClient.findIdea({ "author.token": req.authToken }).then(
    idea => {
      if (idea && idea.ideaDocument) {
        filename = idea.nominationTitle.replace(/'\W'/g, "_") + ".pptx";
        res.download(
          path.join(__dirname, "..", "submissions", idea.ideaDocument),
          filename,
          err => {
            if (err) {
              req.logger.error(err);
              res.end();
            } else {
              req.logger.info("Template Downloaded");
            }
          }
        );
      } else {
        res.download(path.join(__dirname, "..", filename), filename, err => {
          if (err) {
            req.logger.error(err);
            res.end();
          } else {
            req.logger.info("Template Downloaded");
          }
        });
      }
    },
    err => {
      req.logger.error(err);
      res.sendStatus(500);
    }
  );
});

detailsRouter.route("/details").get((req, res) => {
  req.dbClient.findIdea({ "author.email": req.authUser }).then(
    idea => {
      if (!idea) {
        res.sendStatus(401);
      } else {
        const submittedDate =
          idea.submittedDate && idea.submittedDate.toISOString();
        const {
          teamMembers,
          teamName,
          status,
          framework,
          nominationTitle,
          description,
          ideaDocument,
          ideaSubmitted
        } = idea;
        res.send({
          teamMembers,
          teamName,
          submittedDate,
          status,
          framework,
          nominationTitle,
          description,
          ideaDocument,
          ideaSubmitted
        });
      }
    },
    err => {
      req.logger.error(err);
      res.sendStatus(500);
    }
  );
});

module.exports = { detailsRouter };
