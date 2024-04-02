import mongoose from "mongoose";

// Define schema for Message model
const MessageSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  sender: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  usdValue: {
    type: Number,
    required: true
  },
  coinAmount: {
    type: Number,
    required: true
  },
  coinUnit: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model("Message", MessageSchema);

export default Message;
