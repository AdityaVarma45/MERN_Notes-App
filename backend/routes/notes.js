import express from 'express';
import { protect } from '../middleware/auth.js';
import Note from '../models/Note.js';

const router = express.Router();

//Get Notes
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.find({createdBy: req.user._id});
    res.json(notes);
  } catch(err)  {
    console.error("get all notes error: ", err);
    res.status(500).json({message: 'server error'});
  }
})

//Create Post
router.post('/', protect, async (req, res) => {
  const { title, description } = req.body;

  try {
    if (!title || !description) {
      return res.status(400).json({ message: 'Fill all the fields' });
    }

    const note = await Note.create({
      title,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(note);

  } catch (err) {
    console.error("NOTE CREATE ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
});


// Get a note
router.get("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a note
router.put("/:id", protect, async (req, res) => {
  const { title, description } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    note.title = title || note.title;
    note.description = description || note.description;

    const updatedCode = await note.save();
    res.json(updatedCode);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a note
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await note.deleteOne();
    res.json({ message: "Note was deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
