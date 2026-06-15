const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Use MONGO_URI env variable for production (MongoDB Atlas), fallback to localhost for dev
const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'SafePass';
const app = express();
const port = 3000;
app.use(bodyParser.json())
app.use(cors());

// Track connection state to avoid reconnecting on every serverless invocation
let isConnected = false;

async function connectToDb() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log("Connected successfully to MongoDB");
  }
  return client.db(dbName);
}

// Get all passwords
app.get('/', async (req, res) => {
  const db = await connectToDb();
  const collection = db.collection('passwords');
  const findResult = await collection.find({}).toArray();
  res.json(findResult);
});

// Save password
app.post('/', async (req, res) => {
  const passwordEntry = req.body;
  const db = await connectToDb();
  const collection = db.collection('passwords');
  const insertResult = await collection.insertOne(passwordEntry);

  // Respond back with a success status and confirmation
  res.send({ success: true, result: insertResult });
});

// Delete Password
app.delete('/', async (req, res) => {
  const passwordEntry = req.body;
  const db = await connectToDb();
  const collection = db.collection('passwords');
  const deleteResult = await collection.deleteOne({ id: passwordEntry.id });

  // Respond back with a success status and confirmation
  res.send({ success: true, result: deleteResult });
});

// For local development: start the server with app.listen()
// For Vercel serverless: export the Express app as a module
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
  });
}