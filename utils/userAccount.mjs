import { Buffer } from "buffer";
import * as bip39 from "bip39";
import * as crypto from "crypto";
import { generateKeysFromSeed as bitcoinKeyConverter } from "./addressUtils/bitcoin.mjs";
import { generateKeysFromSeed as solanaKeyConverter } from "./addressUtils/solana.mjs";
import { generateKeysFromSeed as evmKeyConverter } from "./addressUtils/evms.mjs";

function createAccount(password) {
  let mnemonic = bip39.generateMnemonic(256);
  let seed = bip39.mnemonicToSeedSync(mnemonic);
  let salt = crypto.randomBytes(16).toString("hex");
  let key = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");
  let cipher = crypto.createCipheriv(
    "aes-256-ctr",
    key.slice(0, 32),
    key.slice(32, 48)
  );
  let encryptedSeed = Buffer.concat([
    cipher.update(seed, "utf8"),
    cipher.final(),
  ]);
  const bitcoinAdd = bitcoinKeyConverter(seed).addresses.address;
  const solanaAdd = solanaKeyConverter(seed).addresses.address;
  const evmAdd = evmKeyConverter(seed).addresses.address;

  let salt1 = crypto.randomBytes(32);
  let iv = crypto.randomBytes(16);
  let cipher1 = crypto.createCipheriv("aes-256-cbc", salt1, iv);
  let newEncryptedSeed = cipher1.update(seed.toString("hex"), "utf8");
  newEncryptedSeed = Buffer.concat([newEncryptedSeed, cipher1.final()]);

  return {
    forBackend: {
      encryptedSeed: encryptedSeed.toString("hex"),
      salt: salt,
      bitcoinAdd: bitcoinAdd,
      solanaAdd: solanaAdd,
      ethAdd: evmAdd,
      avalancheAdd: evmAdd,
      bscAdd: evmAdd,
    },
    forFrontend: {
      encryptedSeed: newEncryptedSeed.toString("hex"),
      salt: salt1.toString("hex"),
      iv: iv.toString("hex"),
    },
  };
}

function afterLogin(encryptedSeed, salt, password) {
  let key = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");
  let decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    key.slice(0, 32),
    key.slice(32, 48)
  );
  let decryptedSeed = Buffer.concat([
    decipher.update(Buffer.from(encryptedSeed, "hex")),
    decipher.final(),
  ]);
  let salt1 = crypto.randomBytes(32);
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv("aes-256-cbc", salt1, iv);
  let encrypted = cipher.update(decryptedSeed.toString("hex"), "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    encryptedSeed: encrypted.toString("hex"),
    salt: salt1.toString("hex"),
    iv: iv.toString("hex"),
  };
}

function getSeedAndPrivateKey(encryptedSeed, salt, iv, option) {
  let encryptedText = Buffer.from(encryptedSeed, "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(salt, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  const seed = hexToAscii(decrypted.toString("hex"));
  let privateKey = "";
  if (option == "bitcoin") {
    privateKey = bitcoinKeyConverter(seed).addresses.privateKey;
  } else if (option == "solana") {
    privateKey = solanaKeyConverter(seed).addresses.privateKey;
  } else if (option == "ethereum" || "avalanche" || "bsc") {
    privateKey = evmKeyConverter(seed).addresses.privateKey;
  }
  return {
    seed: seed,
    privateKey: privateKey,
  };
}

function hexToAscii(hexStr) {
  let asciiStr = "";
  for (let i = 0; i < hexStr.length; i += 2) {
    const hexChar = hexStr.substr(i, 2);
    asciiStr += String.fromCharCode(parseInt(hexChar, 16));
  }
  return asciiStr;
}

export { createAccount, afterLogin, getSeedAndPrivateKey };
