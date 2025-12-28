const express = require('express');
const router = express.Router();
const { updateCharacter, updateScore, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/leaderboard', getLeaderboard);
router.post('/score', protect, updateScore);
router.put('/character', protect, upload.fields([
    { name: 'face', maxCount: 1 },
    { name: 'runSound', maxCount: 1 },
    { name: 'hitSound', maxCount: 1 }
]), updateCharacter);

module.exports = router;
