const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [config.PASSWORD_MIN_LENGTH, `Password must be at least ${config.PASSWORD_MIN_LENGTH} characters`],
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    // Stored as SHA-256 hash — raw token lives only on the client
    refreshToken: {
        type: String,
        default: null,
        select: false // never expose in queries unless explicitly asked
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// ─── Hooks ────────────────────────────────────────────────────────────────────

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── Methods ──────────────────────────────────────────────────────────────────

// Compare entered password against hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate short-lived access token (e.g. 15m or 1d via JWT_EXPIRE)
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    });
};

// Generate long-lived refresh token (e.g. 7d via JWT_EXPIRE)
userSchema.methods.getSignedRefreshToken = function () {
    return jwt.sign({ id: this._id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    });
};

module.exports = mongoose.model('User', userSchema);