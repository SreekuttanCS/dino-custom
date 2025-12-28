const User = require('../models/User');

// @desc    Update user character
// @route   PUT /api/users/character
// @access  Private
const updateCharacter = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // req.files is handled by multer for multiple fields
        // fields: face, runSound, hitSound

        // Ensure customCharacter object exists
        if (!user.customCharacter) {
            user.customCharacter = {};
        }

        if (req.files) {
            // Map uploaded files to paths
            if (req.files['face']) user.customCharacter.face = req.files['face'][0].path;
            if (req.files['runSound']) user.customCharacter.runSound = req.files['runSound'][0].path;
            if (req.files['hitSound']) user.customCharacter.hitSound = req.files['hitSound'][0].path;
        }

        // Also allow updating metadata without files if needed, or if files are separate

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            customCharacter: updatedUser.customCharacter,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update high score
// @route   POST /api/users/score
// @access  Private
const updateScore = async (req, res) => {
    const { score } = req.body;
    const numericScore = Number(score);
    console.log(`[API] Update Score Request - User: ${req.user._id}, Score: ${numericScore}`);

    const user = await User.findById(req.user._id);

    if (user) {
        console.log(`[API] Current User HighScore: ${user.highScore}`);
        if (numericScore > user.highScore) {
            user.highScore = numericScore;
            const updatedUser = await user.save();
            console.log(`[API] Updated HighScore to: ${updatedUser.highScore}`);
            res.json({
                highScore: updatedUser.highScore,
            });
        } else {
            // ... existing else block
            console.log('[API] Score lower than high score, correct? sending back current high score');
            res.json({
                highScore: user.highScore,
            });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    const users = await User.find({})
        .sort({ highScore: -1 })
        .limit(50)
        .select('username avatar highScore');

    res.json(users);
};

module.exports = { updateCharacter, updateScore, getLeaderboard };
