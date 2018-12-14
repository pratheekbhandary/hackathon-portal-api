const { MongoClient } = require("mongodb");

const { MONGODB_URL } = process.env;

class Client {
  constructor(logger) {
    this.logger = logger;
    this.db = null;
    this.connectToDb = this.connectToDb.bind(this);
    this.aquireConnection = this.connect();
    this.aquireConnection.then(this.connectToDb, err => {
      this.db = null;
      this.logger.error(err);
    });
  }
  get ideaCollection() {
    return this.connectToCollection("idea");
  }
  connectToDb(client) {
    this.client = client;
    this.db = client.db("hackathonportal");
    return client;
  }
  connectToCollection(collection) {
    return this.db.collection(collection);
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.logger.info("Connecting to database ...");
      this.logger.debug(MONGODB_URL);
      MongoClient.connect(
        MONGODB_URL,
        { useNewUrlParser: true },
        (err, client) => {
          if (err === null) {
            this.logger.info("Successfully connected to database");
            resolve(client);
          } else {
            this.logger.error("Failed to establish database connection");
            reject(err);
          }
        }
      );
    });
  }
  findIdea(query, projection) {
    if (this.ideaCollection) {
      return this.ideaCollection.findOne(query, projection);
    } else {
      return new Promise((resolve, reject) => {
        this.aquireConnection.then(
          client => {
            this.connectToDb(client);
            this.ideaCollection
              .findOne(query, projection)
              .then(resolve, reject);
          },
          () => reject("No Database Connection")
        );
      });
    }
  }
  insertIdea(document, writeConcern) {
    if (this.ideaCollection) {
      return this.ideaCollection.insertOne(document, writeConcern);
    } else {
      return new Promise((resolve, reject) => {
        this.aquireConnection.then(
          client => {
            this.connectToDb(client);
            this.ideaCollection
              .insertOne(document, writeConcern)
              .then(resolve, reject);
          },
          () => reject("No Database Connection")
        );
      });
    }
  }
  updateIdea(query, update, options) {
    if (this.ideaCollection) {
      return this.ideaCollection.updateOne(query, update, options);
    } else {
      return new Promise((resolve, reject) => {
        this.aquireConnection.then(
          client => {
            this.connectToDb(client);
            this.ideaCollection
              .updateOne(query, update, options)
              .then(resolve, reject);
          },
          () => reject("No Database Connection")
        );
      });
    }
  }
  useCollection(collection) {
    return new Promise((resolve, reject) => {
      if (this.db == null) {
        this.aquireConnection.then(
          client => {
            this.connectToDb(client);
            resolve(this.connectToCollection(collection));
          },
          () => reject("No Database Connection")
        );
      } else {
        if (collection === "idea") {
          resolve(this.ideaCollection);
        } else {
          resolve(this.connectToCollection(collection));
        }
      }
    });
  }
  disconnect() {
    this.logger.info("Disconnecting from Database ...");
    this.client.close();
  }
}

module.exports = { Client };
