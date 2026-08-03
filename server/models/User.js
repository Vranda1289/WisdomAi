import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  theme: {
    type: String,
    default: 'winter_morning'
  },
  language: {
    type: String,
    default: 'english'
  },
  adaptiveRelationship: {
    relationshipMode: {
      type: String,
      default: 'Calm Guide',
      enum: ['Friend', 'Elder Brother', 'Elder Sister', 'Parent', 'Mentor', 'Calm Guide', 'Spiritual Companion', 'Listener', 'Coach']
    },
    nickname: {
      type: String,
      default: ''
    },
    emojiPreference: {
      type: String,
      default: 'adaptive',
      enum: ['adaptive', 'none', 'frequent']
    },
    formalCasual: {
      type: String,
      default: 'adaptive',
      enum: ['adaptive', 'formal', 'casual']
    },
    mirroredEmojis: {
      type: [String],
      default: []
    },
    mirroredWords: {
      type: [String],
      default: []
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
