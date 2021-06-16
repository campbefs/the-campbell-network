const { Thought, User } = require('../models');

const thoughtController = {
  // get all thoughts
  // body fields: thoughtText, username, userId (not a field), reactions (optional)
  getAllThoughts(req, res) {
    Thought.find({})
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then(dbThoughtData => res.json(dbThoughtData))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // get one thought by id
  getThoughtById({ params }, res) {
    Thought.findOne({ _id: params.id })
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .select('-__v')
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          res.status(404).json( {message: 'No thought found with this id!'})
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // create new thought -- & push thought ID to user's thought array field
  // body fields: thoughtText, username, userId (not a field), reactions (optional)
  createThought({ body }, res) {

    // Check if user exists first
    User.findOne({ _id: body.userId, username: body.username })
      .then(dbUserData => {
        // check database, if no user found then send 404 response
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with that username/id combo'});
          return;
        }

        // Create thought
        Thought.create({
          thoughtText: body.thoughtText,
          username: body.username
        }
        )
          .then(dbThoughtData => {

            // Update userdata
            User.findOneAndUpdate(
              { _id: body.userId },
              { $push: { thoughts: dbThoughtData._id }}
            )
              .then(dbUpdatedUserData => {

                // return thought data -- not updated user data
                res.status(200).json(dbThoughtData);
              })
              .catch(err => res.status(400).json(err));

          })
          .catch(err => res.status(400).json(err));

      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });

  },

  // update a thought by ID
  // body: thoughtText, username
  updateThought({ params, body }, res) {
    Thought.findOneAndUpdate(
      { _id: params.id }, 
      { thoughtText: body.thoughtText },
      {new: true, runValidators: true}
    )
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No thought found with this id! '});
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.status(404).json(err));
  },

  // delete a thought by ID
  deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No Thought found with this id! '});
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.status(400).json(err));
  },

  // Create a new reaction
  // api/thoughts/:thoughtId/reactions
  // body: reactionBody, username
  createReaction({ params, body }, res) {

    // check to make sure username exists in database

    User.findOne({
      username: body.username
    })
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({message: "No user found with that username!"});
          return;
        }

        Thought.findOneAndUpdate(
          { _id: params.thoughtId },
          { $addToSet: { reactions: body }},
          { runValidators: true, new: true }
        )
          .then(dbReactionData => {
    
            if (!dbReactionData) {
              res.status(404).json({ message: "No thought found with this id!" });
              return;
            }
            res.json(dbReactionData);
          })
          .catch(err => {
            console.log(err);
            res.status(404).json(err);
          })

      })
  },

  // Delete a reaction 
  deleteReaction({ params }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $pull: { reactions: {reactionId: params.reactionId } }},
      { new: true }
    )
      .then(dbReactionData => {

        if (!dbReactionData) {
          res.status(404).json({ message: "No thought/reaction combo found with these ids!" });
          return;
        }
        res.json(dbReactionData);
      })
      .catch(err => {
        console.log(err);
        res.status(404).json(err);
      })

  }
}

module.exports = thoughtController;