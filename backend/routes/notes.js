const express = require('express');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const Tenant = require('../models/Tenant');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('content').trim().isLength({ min: 1, max: 10000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const tenant = req.user.tenant;

    // Check note limit for free plan
    if (tenant.subscription === 'free') {
      const noteCount = await Note.countDocuments({ tenant: tenant._id });
      if (noteCount >= tenant.noteLimit) {
        return res.status(403).json({ 
          message: 'Note limit reached. Upgrade to Pro for unlimited notes.',
          limitReached: true
        });
      }
    }

    const note = new Note({
      title,
      content,
      author: req.user._id,
      tenant: tenant._id
    });

    await note.save();
    await note.populate('author', 'email');

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes
// @desc    Get all notes for current tenant
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ tenant: req.user.tenant._id })
      .populate('author', 'email')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a specific note
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      tenant: req.user.tenant._id 
    }).populate('author', 'email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('content').optional().trim().isLength({ min: 1, max: 10000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = await Note.findOne({ 
      _id: req.params.id, 
      tenant: req.user.tenant._id 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Update fields
    if (req.body.title) note.title = req.body.title;
    if (req.body.content) note.content = req.body.content;

    await note.save();
    await note.populate('author', 'email');

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      tenant: req.user.tenant._id 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
