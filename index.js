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
  try {

    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();
    const taskContainer = client.db('allTask').collection('Tasks')
    const userCollection = client.db('allTask').collection('users')


       app.get('/tasks/:email', async (req, res) => {
        const { email } = req.params;
        try {
          const tasks = await taskContainer.find({ email }).toArray();
          res.json(tasks);
        } catch (error) {
          res.status(500).json({ error: 'Failed to fetch tasks' });
        }
      });

      app.post('/users', async (req, res) => {
        try {
          const { email, name } = req.body;
          
          if (!email || !name) {
            return res.status(400).json({ message: "Email and name are required" });
          }
      
          const existingUser = await userCollection.findOne({ email });
      
          if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
          }
      
          const result = await userCollection.insertOne({ name, email });
          
          res.status(201).json(result);
        } catch (error) {
          console.error("Database error:", error);
          res.status(500).json({ message: "Internal server error" });
        }
      });

      app.get('/users/:email', async (req, res)=>{
        const email =req.params.email;
        const result = await userCollection.findOne({email})
        res.send(result)
      })
      
      app.get('/singleTasks/:id', async (req, res) => {
        const  id  = req.params.id;
        const query = {_id: new ObjectId(id)}
          const result = await taskContainer.findOne(query)
          res.json(result);
      });
  
      app.post('/tasks', async(req,res)=> {
        const task = req.body
        const result = await taskContainer.insertOne(task)
        res.send(result)
      })
  

      app.put('/tasks/:id', async(req,res) => {
        const id = req.params.id
        const task = req.body
        const filter = {_id : new ObjectId(id)} 
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            title: task.title,
            description: task.description,
            category: task.category
          }
        }
        const result = await taskContainer.updateOne(filter, updatedDoc, options);
        res.send(result)
      })
  
  

      app.put('/dragTask/:id', async (req, res) => {
        const id = req.params.id
        const {category} = req.body
        const filter = {_id: new ObjectId(id)}
        const updatedTask = {
          $set:{
            category: category
          }
        }
  
        const result = await taskContainer.updateOne(filter,updatedTask)
        res.send(result)
      })
  
      app.delete('/tasks/:id', async(req,res)=>{
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await taskContainer.deleteOne(query)
        res.send(result)
      })

    
   
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res)=>{
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
