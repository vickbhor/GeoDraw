const express = require('express');
const Geometry = require('../models/Geometry');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET all geometries for the logged-in user
router.get('/', async (req, res) => {
  const items = await Geometry.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(items);
});

// CREATE
router.post('/', async (req, res) => {
  const { name, type, color, geojson } = req.body;
  const item = await Geometry.create({ user: req.userId, name, type, color, geojson });
  res.status(201).json(item);
});

// UPDATE (rename, recolor, or edit shape)
router.put('/:id', async (req, res) => {
  const item = await Geometry.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

// DELETE
router.delete('/:id', async (req, res) => {
  const item = await Geometry.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;