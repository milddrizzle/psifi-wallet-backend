import express from "express";
import {
  createUser,
  loginUser,
  logoutCurrentUser,
  checkExistUser,
  getAddressFromUsername,
  getPrivateKey
} from "../controllers/userController.mjs";
import {
  recordMessage,
  getMessage,
  getContactList
} from "../controllers/messageController.mjs";

const router = express.Router();

router.route("/").post(createUser);
router.post("/auth", loginUser);
router.post("/logout", logoutCurrentUser);
router.post("/checkExistUser", checkExistUser);
router.post("/getAddress", getAddressFromUsername);
router.post("/recordMessage", recordMessage);
router.post("/getMessage", getMessage);
router.post("/getContactList", getContactList);
router.post("/getPrivateKey", getPrivateKey);

export default router;
