require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Todo = require('./models/Todo');

const app = express();

app.use(cors());
app.use(express.json());

// Mongoose keeps its own connection pool; connecting once at module scope
// works both for `node server.js` locally and for Vercel serverless functions,
// which reuse the module between warm invocations.
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todos')
  .catch((err) => console.error('MongoDB connection error:', err.message));

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    if (!req.body.text || !req.body.text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }
    const todo = await Todo.create({ text: req.body.text.trim() });
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Local dev only. On Vercel this file is loaded as a serverless function
// (see vercel.json), so the app is exported instead of listened on.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

module.exports = app;
