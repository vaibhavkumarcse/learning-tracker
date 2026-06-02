const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, username, email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        
        // Use the access_token to fetch user info from Google
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const { email, name, picture } = googleRes.data;
        
        if (!email) {
            return res.status(400).json({ message: 'Unable to get email from Google' });
        }

        let user = await User.findOne({ email });
        
        if (!user) {
            // Create a new user with a random password for Google sign-ups
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            
            let baseUsername = name || email.split('@')[0];
            // Remove any spaces or special characters for cleaner usernames (optional but recommended)
            baseUsername = baseUsername.replace(/\s+/g, '');
            let username = baseUsername;
            let counter = 1;
            
            // Ensure username uniqueness
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = new User({
                username,
                email,
                password: randomPassword,
                avatar: picture
            });
            await user.save();
        }

        const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: jwtToken, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};
