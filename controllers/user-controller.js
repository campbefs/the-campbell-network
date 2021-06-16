const { User } =  require('../models');

const userController = {

  // get all users
  getAllUsers(req, res) {
    User.find({})
      // .populate({
      //   path: 'thoughts',
      //   select: '-__v'
      // })
      .populate({
        path:'friends',
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
  // localhost:3001/api/users/:id
  getUserById({ params }, res) {
    User.findOne({ _id: params.id })
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .populate({
        path:'thoughts',
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
    User.create(body) // username, email, thoughts (optional), friends (optional)
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

    if (params.friendId === params.userId) {
      res.status(404).json( { message: 'Friend ID must be different from User ID'})
      return;
    }

    // find user in database
    User.findOne({ _id: params.friendId })
      .select('-__v')
      .then(dbFriendData => {
        // if no userid exists send 404
        if (!dbFriendData) {
          res.status(404).json( {message: 'No friend found with this id!'});
          return;
        }

        // friend already exists begin logic
        User.findOne({ 
          _id: params.userId, 
          friends: {
            $in:[params.friendId]
          }
        })
          .select('-__v')
          .then(dbUserData => {
            // IF RESULT IS RETURNED FROM USERID+FRIEND COMBO THEN 404
            if (dbUserData) {
              res.status(404).json({message: 'User already has that friend'});
              return;
            }

            // UPDATE
            User.findOneAndUpdate(
              { _id: params.userId }, // find the user
              { $push: { friends: params.friendId }}, // add friend
              { new: true } // return doc after update was applied
            )
              .then(dbUpdateData => {
                if (!dbUpdateData) {
                  return res.status(404).json({ message: 'No User found with this ID!'})
                }
                res.json(dbUpdateData);
              })
              .catch(err => {
                console.log(err);
                res.status(500).json(err);
              });    

          })
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      })
  },


  // delete to remove a friend from a user's friend list
  //    /api/users/:userId/friends/:friendId

  deleteUserFriend({ params }, res) {

    if (params.friendId === params.userId) {
      res.status(404).json( { message: 'Friend ID must be different from User ID'})
      return;
    }

    // find user in database
    User.findOne({ _id: params.friendId })
      .select('-__v')
      .then(dbFriendData => {
        // database - if no friend userid exists send 404
        if (!dbFriendData) {
          res.status(404).json( {message: 'No friend found in database with this id!'});
          return;
        }

        // friend doesn't exist in list - begin logic
        User.findOne({ 
          _id: params.userId, 
          friends: {
            $in:[params.friendId]
          }
        })
          .select('-__v')
          .then(dbUserData => {
            // friendslist- IF NO RESULT IS RETURNED FROM USERID+FRIEND COMBO THEN 404
            if (!dbUserData) {
              res.status(404).json({message: 'No friend found in friendslist with that id'});
              return;
            }

            // UPDATE
            User.findOneAndUpdate(
              { _id: params.userId }, // find the user
              { $pull: { friends: params.friendId }}, // remove friend
              { new: true } // return doc after update was applied
            )
              .then(dbUpdateData => {
                if (!dbUpdateData) {
                  return res.status(404).json({ message: 'No User found with this ID!'})
                }
                res.json(dbUpdateData);
              })
              .catch(err => {
                console.log(err);
                res.status(500).json(err);
              });    

          })
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      })
  },

}

module.exports = userController;