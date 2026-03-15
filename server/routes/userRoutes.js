const express = require('express');
const { searchUsers, followUser, unfollowUser, getFollowing, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.post('/:userId/follow', followUser);
router.delete('/:userId/follow', unfollowUser);
router.get('/following', getFollowing);
router.put('/profile', upload.single('avatar'), updateProfile);

module.exports = router;