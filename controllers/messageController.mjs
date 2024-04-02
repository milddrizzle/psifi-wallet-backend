import Message from "../models/txMessageModel.mjs";
import User from "../models/userModel.mjs";
import asyncHandler from "../middlewares/asyncHandler.mjs";
import { ethers } from "ethers";
import abi from "../utils/erc20.abi.json" assert { type: "json" };
const HTTPSProvider = new ethers.JsonRpcProvider(
  process.env.NODE_URL || "https://api.avax-test.network/ext/bc/C/rpc"
);
let iface = new ethers.Interface(abi);

const recordMessage = asyncHandler(async (req, res) => {
  const { txHash, sender, receiver, usdValue, coinAmount, coinUnit } = req.body;
  if (!txHash) {
    throw new Error("Please fill all the inputs.");
  }
  const newMessage = new Message({ txHash, sender, receiver, usdValue, coinAmount, coinUnit });
  try {
    await newMessage.save();
    return res.status(201).json({
      _id: newMessage._id,
      txHash: newMessage.txHash,
      sender: newMessage.sender,
      receiver: newMessage.receiver,
      usdValue: newMessage.usdValue,
      coinAmount: newMessage.coinAmount,
      coinUnit: newMessage.coinUnit,
      date: newMessage.date
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid message data" });
  }
});

// can access contract address
const getMessage = asyncHandler(async (req, res) => {
  const { address, coin } = req.body;
  let sent = [];
  let received = [];
  try {
    sent = await Message.find({ sender: address, coinUnit: coin });
    received = await Message.find({ receiver: address, coinUnit: coin });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
    return;
  }

  let options = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };

  sent = await Promise.all(sent.map(async item => ({
    ...item._doc,
    receiver: await getUsernameFromAddress(item._doc.receiver),
    status: 'Sent',
    legacy_date: item._doc.date,
    date: new Date(item._doc.date).toLocaleString('en-US', options).replace(' AM', 'am').replace(' PM', 'pm')
  })));

  received = await Promise.all(received.map(async item => ({
    ...item._doc,
    sender: await getUsernameFromAddress(item._doc.sender),
    status: 'Received',
    legacy_date: item._doc.date,
    date: new Date(item._doc.date).toLocaleString('en-US', options).replace(' AM', 'am').replace(' PM', 'pm')
  })));

  // Union the arrays and sort by date
  const messages = sent.concat(received).sort((a, b) => new Date(b.legacy_date) - new Date(a.legacy_date));

  return res.status(200).json({ messages });
});

const getUsernameFromAddress = async (address) => {
  const user = await User.aggregate([
    {
      $addFields: {
        addressArray: { $objectToArray: "$address" }
      }
    },
    {
      $match: {
        $or: [
          { "addressArray.v": { $regex: address, $options: "i" } }
        ]
      }
    }
  ]);
  if (user.length === 0) return "unknown";
  return user[0].username;
};

// can access contract address
const getContactList = asyncHandler(async (req, res) => {
  const { addresses } = req.body;
  let contacts = [];
  try {
    let sent = await Message.find({ sender: { $in: addresses } }, 'receiver');
    let received = await Message.find({ receiver: { $in: addresses } }, 'sender');
    let receiverAddresses = sent.map(message => message.receiver);
    let senderAddresses = received.map(message => message.sender);
    contacts = [...new Set([...receiverAddresses, ...senderAddresses])];
    const names = await Promise.all(contacts.map((address) => getUsernameFromAddress(address)))
    // Union the arrays and sort by date
    return res.status(200).json({ contacts: names })
  }
  catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
    return;
  }

});

export { recordMessage, getMessage, getContactList };
