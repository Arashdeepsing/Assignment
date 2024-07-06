// userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
});

const User = mongoose.model('User', userSchema);

export default User;