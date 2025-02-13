import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose, { Model } from 'mongoose'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Thought = mongoose.model('Thought', {
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  hearts: {
    type: Number,
    default: 0
  }
})

// Defines the port the app will run on.
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// ROUTES
app.get('/', (req, res) => {
  res.send('Hello, this is Lindas Happy Thoughts API. Go to https://github.com/lindahz/project-happy-thoughts-api for documentation.')
})

// GET endpoint to show messages and hearts
app.get('/thoughts', async (req, res) => {
  const thoughts = await Thought.find().sort({createdAt: 'desc'}).limit(20).exec()
  res.json(thoughts)
})

// POST endpoint to send thoughts
app.post('/thoughts', async (req, res) => {
  const { message } = req.body
  const thought = new Thought({ message })
  try {
    const savedThought = await thought.save()
    res.status(201).json(savedThought)
  } catch (err) {
    res.status(400).json({ message: 'Could not save thought', error: err.errors })
  }
})

// POST endpoint to send hearts
app.post('/thoughts/:id/like', async (req, res) => {
  try {
    const { id } = req.params
    const updatedLike = await Thought.updateOne({ _id: id }, { $inc: { 'hearts': 1 } })
    res.status(201).json(updatedLike)
  } catch (err) {
    res.status(404).json({ message: 'Could not like thought', error: err.errors })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
