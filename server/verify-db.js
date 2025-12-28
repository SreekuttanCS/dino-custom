require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const verifyDB = async () => {
    console.log('1. Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected successfully.');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }

    const testUsername = 'test_verify_bot_' + Date.now();
    const testEmail = testUsername + '@example.com';
    let userId;

    try {
        console.log(`2. Creating test user: ${testUsername}`);
        const user = await User.create({
            username: testUsername,
            email: testEmail,
            password: 'password123',
            highScore: 10
        });
        userId = user._id;
        console.log('✅ User created with High Score:', user.highScore);

        console.log('3. Updating High Score to 500...');
        user.highScore = 500;
        await user.save();
        console.log('✅ Save command executed.');

        console.log('4. Fetching user from DB to verify persistence...');
        const fetchedUser = await User.findById(userId);
        if (fetchedUser.highScore === 500) {
            console.log('✅ SUCCESS: High Score is 500.');
        } else {
            console.error('❌ FAILURE: High Score is', fetchedUser.highScore);
        }

        console.log('5. Cleaning up...');
        await User.findByIdAndDelete(userId);
        console.log('✅ Test user deleted.');

    } catch (err) {
        console.error('❌ Error during verification:', err);
    } finally {
        await mongoose.disconnect();
        console.log('6. Disconnected.');
    }
};

verifyDB();
