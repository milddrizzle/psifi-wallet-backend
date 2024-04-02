import * as bitcoin from "bitcoinjs-lib";

// Generate private key and Bech32 address from seed
function generateKeysFromSeed(rootSeed) {
    // Use bitcoinjs-lib's fromSeed method to create a BIP32 node
    const bitcoinNode = bitcoin.bip32.fromSeed(Buffer.from(rootSeed, "hex"));

    // Derive the key pair for the specified path
    const bitcoinKeyPair = bitcoinNode.derivePath("m/44'/0'/0'/0/0");

    // Convert the private key to Wallet Import Format (WIF)
    const bitcoinPrivateKey = bitcoinKeyPair.toWIF();

    // Generate a Bech32 (SegWit) address
    const { address: bitcoinAddress } = bitcoin.payments.p2wpkh({
        pubkey: bitcoinKeyPair.publicKey,
        network: bitcoin.networks.bitcoin, // Use bitcoin.networks.testnet for testnet
    });

    return {
        addresses: {
            privateKey: bitcoinPrivateKey,
            address: bitcoinAddress || "", // Fallback to empty string if undefined
        },
    };
}

export { generateKeysFromSeed };
