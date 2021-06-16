const router = require('express').Router();
const {
  getAllThoughts, 
  getThoughtById,
  createThought,
  updateThought,
  deleteThought,
  createReaction,
  deleteReaction
} = require('../../controllers/thought-controller');

// api/thoughts
router
  .route('/')
  .get(getAllThoughts)
  .post(createThought)
  ;

// ID routes
router
  .route('/:id')
  .get(getThoughtById)
  .put(updateThought)
  .delete(deleteThought);

// Thought ID & ReactionID Routes
router
  .route('/:thoughtId/reactions')
  .post(createReaction)
  ;

// Delete reaction 
router
  .route('/:thoughtId/reactions/:reactionId')
  .delete(deleteReaction)
  ;

module.exports = router;