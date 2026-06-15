const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// ─── MongoDB Connection (Serverless-safe, cached) ─────────────────────
// Cache the client and db promise across warm invocations.
// This is the standard pattern for serverless MongoDB — we cache the
// resolved promise, not a boolean flag, so concurrent requests during
// cold start all await the same connection attempt.
let cachedClient = null;
let cachedDb = null;

async function connectToDb() {
  // Return cached connection if it already exists and is connected
  if (cachedClient && cachedDb) {
    console.log('Using cached MongoDB connection');
    return cachedDb;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('FATAL: MONGO_URI environment variable is not defined.');
    throw new Error('MONGO_URI environment variable is not set. Add it in Vercel Project Settings → Environment Variables.');
  }

  console.log('Establishing new MongoDB connection...');

  try {
    const client = new MongoClient(uri, {
      // Prevent the default 30s timeout — fail fast at 5s so the
      // serverless function doesn't hang until Vercel's 10s limit
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db('SafePass');

    // Cache for reuse across warm invocations
    cachedClient = client;
    cachedDb = db;

    console.log('Connected successfully to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Don't cache a failed connection
    cachedClient = null;
    cachedDb = null;
    throw error;
  }
}

// ─── Express App Setup ─────────────────────────────────────────────────
const app = express();
app.use(bodyParser.json());
app.use(cors());

const router = express.Router();

// Get all passwords
router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    const collection = db.collection('passwords');
    const findResult = await collection.find({}).toArray();
    console.log(`GET /api/ — fetched ${findResult.length} passwords`);
    res.json(findResult);
  } catch (error) {
    console.error('GET /api/ failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch passwords', details: error.message });
  }
});

// Save password
router.post('/', async (req, res) => {
  try {
    const passwordEntry = req.body;
    const db = await connectToDb();
    const collection = db.collection('passwords');
    const insertResult = await collection.insertOne(passwordEntry);
    console.log('POST /api/ — password saved:', insertResult.insertedId);
    res.json({ success: true, result: insertResult });
  } catch (error) {
    console.error('POST /api/ failed:', error.message);
    res.status(500).json({ error: 'Failed to save password', details: error.message });
  }
});

// Delete password
router.delete('/', async (req, res) => {
  try {
    const passwordEntry = req.body;
    const db = await connectToDb();
    const collection = db.collection('passwords');
    const deleteResult = await collection.deleteOne({ id: passwordEntry.id });
    console.log('DELETE /api/ — deleted:', deleteResult.deletedCount, 'document(s)');
    res.json({ success: true, result: deleteResult });
  } catch (error) {
    console.error('DELETE /api/ failed:', error.message);
    res.status(500).json({ error: 'Failed to delete password', details: error.message });
  }
});

// Always start the server (Render is not serverless)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;