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
        res.status(201).json({ token, user: { id: user._id, username, email, avatar: user.avatar, darkMode: user.darkMode } });
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
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, darkMode: user.darkMode } });
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
        res.json({ token: jwtToken, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, darkMode: user.darkMode } });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

        // Generate 6-digit OTP code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        console.log(`[RESET PASSWORD] OTP for ${email} is ${otp}`);

        // Return OTP in response for demo purposes (so the frontend can read it without actual email sending)
        res.json({ message: 'Verification code generated successfully', otp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email, 
            resetPasswordOTP: otp,
            resetPasswordOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email, avatar, currentPassword, newPassword, darkMode } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username) user.username = username;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;
        if (darkMode !== undefined) user.darkMode = darkMode;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect current password' });
            }
            user.password = newPassword;
        }

        await user.save();

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            darkMode: user.darkMode
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
