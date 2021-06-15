const { User } =  require('../models');

const userController = {

  // get all users
  getAllUsers(req, res) {
    User.find({})
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then(dbUserData => res.json(dbUserData))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // get one user by id
  getUserById({ params }, res) {
    User.findOne({ _id: params.id })
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .select('-__v')
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json( {message: 'No user found with this id!'});
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // create new user
  createUser({ body }, res) {
    User.create(body)
      .then(dbUserData => res.json(dbUserData))
      .catch(err => res.status(400).json(err));
  },

  // update user by id
  updateUser({ params, body }, res) {
    User.findOneAndUpdate({ _id: params.id }, body, {new: true, runValidators: true})
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!'});
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => res.status(400).json(err));
  },

  // delete user
  deleteUser({ params }, res) {
    User.findOneAndDelete({ _id: params.id })
      .then(dbUserData => {
        if(!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!'});
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => res.status(400).json(err));
  },

  // post to add a new friend to user's friend list
  //    /api/users/:userId/friends/:friendId

  addUserFriend({ params }, res) {
    User.findOne({ _id: params.userId })
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .select('-__v')
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json( {message: 'No user found with this id!'});
          return;
        }

        User.findOne({ _id: params.friendId })
        .populate({
          path: 'thoughts',
          select: '-__v'
        })
        .select('-__v')
        .then(dbFriendData => {
          if (!dbFriendData) {
            res.status(404).json( {message: 'No friend found with this id!'});
            return;
          }

          return User.findOneAndUpdate(
            { _id: params.userId }, // find the user
            { $push: { friends: params.friendId }}, // add friend
            { new: true } // return doc after update was applied
          );

        })
        .catch(err => {
          console.log(err);
          res.status(400).json(err);
        });
      })
  },

  // delete to remove a friend from a user's friend list
  //    /api/users/:userId/friends/:friendId

  deleteUserFriend({ params }, res) {
    User.findOne({ _id: params.userId })
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .select('-__v')
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json( {message: 'No user found with this id!'});
          return;
        }

        User.findOne({ _id: params.friendId })
        .populate({
          path: 'thoughts',
          select: '-__v'
        })
        .select('-__v')
        .then(dbFriendData => {
          if (!dbFriendData) {
            res.status(404).json( {message: 'No friend found with this id!'});
            return;
          }

          return User.findOneAndUpdate(
            { _id: params.userId }, // find the user
            { $pull: { friends: params.friendId }}, // remove friend
            { new: true } // return doc after update was applied
          );

        })
        .catch(err => {
          console.log(err);
          res.status(400).json(err);
        });
      })
  },


}

module.exports = userController;