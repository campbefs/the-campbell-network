const router = require('express').Router();
const { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser,
    deleteUser,
    addUserFriend,
    deleteUserFriend
  } = require('../../controllers/user-controller');


// Route Directory Routes
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

// ID Routes
router
  .route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// UserID & FriendID Routes
router
  .route('/:userId/friends/:friendId')
  .post(addUserFriend)
  .delete(deleteUserFriend);

module.exports = router;
