require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.haqk7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    const taskContainer = client.db('allTask').collection('Tasks')
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    app.post('/task', async (req, res) => {
      const data = req.body;
      const result = await taskContainer.insertOne(data);
      res.send(result);
    });

    app.get('/taskRead', async (req, res) => {
      const result = await taskContainer.find().toArray();
      res.send(result);
    });

    app.delete('/deleteTask/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskContainer.deleteOne(query);
      res.send(result);
    });

    // Update Task
    app.put('/updateTask/:id', async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          task:updatedTask.task,
          description:updatedTask.description,
          time:updatedTask.time,
          category:updatedTask.category
        },
      };
      const result = await taskContainer.updateOne(query, updateDoc);
      res.send(result); // Send result back
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
