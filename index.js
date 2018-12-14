const compression = require("compression");
const cookieParser = require("cookie-parser");
const express = require("express");
const http = require("http");
const log4js = require("log4js");

log4js.configure({
  appenders: {
    console: { type: "stdout" },
    logFile: {
      type: "dateFile",
      filename: "log/hackathon-portal-api.log",
      keepFileExt: true
    }
  },
  categories: {
    default: { appenders: ["console", "logFile"], level: "debug" }
  }
});

const logger = log4js.getLogger();

const { Client } = require("./db/connect");
const { detailsRouter } = require("./routes/details");
const { loginRouter } = require("./routes/login");
const { logoutRouter } = require("./routes/logout");
const { profileRouter } = require("./routes/profile");
const { saveRouter } = require("./routes/save");

const dbClient = new Client(logger);

const app = express();
const jsonParser = express.json();

function requestEnhancer(req, res, next) {
  req.logger = logger;
  req.dbClient = dbClient;
  next();
}

function userMapper(req, res, next) {
  const username = req.header("X-Hackathon-User");
  const token = req.cookies.AuthToken;
  if (token) {
    req.authUser = username;
    req.authToken = token;
    res.cookie("AuthToken", token, {
      httpOnly: true,
      maxAge: 900000
    });
    next();
  } else {
    res.sendStatus(401);
  }
}

app.use(
  "/api",
  compression(),
  cookieParser(),
  jsonParser,
  log4js.connectLogger(logger, { level: "auto" }),
  requestEnhancer,
  loginRouter,
  logoutRouter,
  userMapper,
  profileRouter,
  detailsRouter,
  saveRouter
);

app.get("*", (req, res) => {
  http.get(
    {
      port: 3000,
      path: req.url
    },
    response => {
      if (response.statusCode === 404) {
        http.get(
          {
            port: 3000,
            path: "/"
          },
          indexResponse => {
            if (indexResponse.statusCode === 404) {
              res.sendStatus(404);
            } else {
              res.writeHead(
                indexResponse.statusCode,
                indexResponse.statusMessage,
                indexResponse.headers
              );
              indexResponse.on("data", chunk => res.write(chunk));
              indexResponse.on("end", () => {
                res.end();
              });
              indexResponse.on("error", () => {
                res.sendStatus(400);
              });
            }
          }
        );
      } else {
        res.writeHead(
          response.statusCode,
          response.statusMessage,
          response.headers
        );
        response.on("data", chunk => res.write(chunk));
        response.on("end", () => {
          res.end();
        });
        response.on("error", () => {
          res.sendStatus(400);
        });
      }
    }
  );
});

app.use((err, req, res, next) => {
  if (err) {
    res.sendStatus(500);
  }
});

const server = app.listen(9000, () => {
  logger.info("Server Started");
});

function shutdownServer() {
  dbClient.disconnect();

  logger.info("Stopping server ...");
  server.close(() => {
    logger.info("Server Stopped");
    log4js.shutdown(() => {});
  });
}

process.on("SIGTERM", shutdownServer);
process.on("SIGINT", shutdownServer);
