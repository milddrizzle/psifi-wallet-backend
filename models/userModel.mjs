import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AddressSchema = new mongoose.Schema({
  bitcoin: {
    type: String,
    required: true
  },
  solana: {
    type: String,
    required: true
  },
  ethereum: {
    type: String,
    required: true
  },
  avalanche: {
    type: String,
    required: true
  },
  bsc: {
    type: String,
    required: true
  }
});

// Define schema for User model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    min: 8
  },
  profileImage: {
    type: String,
    required: true
  },
  rootSeed: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  address: AddressSchema,
  date: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
