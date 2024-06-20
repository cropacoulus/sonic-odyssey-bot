import { Connection,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    PublicKey,
    Keypair
} from "@solana/web3.js";
import bip39 from 'bip39';
import {derivePath} from 'ed25519-hd-key';
import base58 from 'bs58';
import colors from 'colors';

const DEVNET_URL = 'https://devnet.sonic.game/';
const connection = new Connection(DEVNET_URL, 'confirmed');

const sendSol = async (fromKeypair, toPublicKey, amount) => {
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: toPublicKey,
            lamports: amount * LAMPORTS_PER_SOL,
        })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);

    console.log('Transaction confirmed with signature: '.green, signature);
}

const generateRandomAdresses = (count) => {
    return Array.from({ length: count }, () => Keypair.generate().publicKey.toString());
} 

const getKeypairFromSeedPharse = async (seedPharse) => {
    const seed = await bip39.mnemonicToSeed(seedPharse);
    const deriveSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
    return Keypair.fromSeed(deriveSeed.slice(0, 32));
}

const getKeypairFromPrivateKey = (privateKey) => {
    return Keypair.fromSecretKey(base58.decode(privateKey));
}

export {
    sendSol,
    generateRandomAdresses,
    getKeypairFromSeedPharse,
    getKeypairFromPrivateKey,
    DEVNET_URL,
    connection,
    PublicKey
};