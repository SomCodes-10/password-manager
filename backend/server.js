const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'SafePass';
const app = express();
const port = 3000;
app.use(bodyParser.json())
app.use(cors());

// ADDED: Main async function to handle the database connection cleanly
async function startServer() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");

    // FIXED: Added 'async' to the route handler parameters
    app.get('/', async (req, res) => {
      const db = client.db(dbName);
      const collection = db.collection('passwords');
      const findResult = await collection.find({}).toArray();
      res.json(findResult);
    }); // FIXED: Added the missing '});' closure here

    //Save password
    app.post('/', async (req, res) => {
      const passwordEntry = req.body;
      const db = client.db(dbName);
      const collection = db.collection('passwords');
      const insertResult = await collection.insertOne(passwordEntry);

      // Respond back with a success status and confirmation
      res.send({ success: true, result: insertResult });
    });

   

    //Delete Password
    app.delete('/', async (req, res) => {
      const passwordEntry = req.body;
      const db = client.db(dbName);
      const collection = db.collection('passwords');
      const deleteResult = await collection.deleteOne({ id: passwordEntry.id });

      // Respond back with a success status and confirmation
      res.send({ success: true, result: deleteResult });
    });


    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
}

// Execute the server initialization
startServer();