import fs from 'fs';
import readlineSync from 'readline-sync';

import { 
    sendSol, 
    generateRandomAdresses,
    getKeypairFromSeedPharse,
    getKeypairFromPrivateKey,
    PublicKey
} from './helper/solana.js';
import { display } from './helper/display.js';

(async () => {
    display();
    const method = readlineSync.question(
        'Select input method (0 for seed phrase, 1 for private key): '
    );

    let seedPharsesOrKeys;

    if (method === '0') {
        seedPharsesOrKeys = JSON.parse(fs.readFileSync('accounts.json', 'utf-8'));

        if (!Array.isArray(seedPharsesOrKeys) || seedPharsesOrKeys.length === 0) {
            console.error('accounts.json is not set correctly or is empty'.red);
        }
    } else if (method === '1') {
        seedPharsesOrKeys = JSON.parse(fs.readFileSync('accounts.json', 'utf-8'));

        if (!Array.isArray(seedPharsesOrKeys) || seedPharsesOrKeys.length === 0) {
            console.error('accounts.json is not correctly or is empty'.red);
        }
    } else {
        console.error('Invalid input method selected'.red);
    }

    const defaultAddressCount = 100;
    const addressCountInput = readlineSync.question(
        `How many random addresses do you want to generate? (default is ${defaultAddressCount}): `
    );

    const addressCount = addressCountInput
        ? parseInt(addressCountInput, 10)
        : defaultAddressCount;

    if (isNaN(addressCount) || addressCount <= 0) {
        console.error('Invalid number of addresses specified'.red);
    }

    const randomAddresses = generateRandomAdresses(addressCount);

    console.log(`Generated ${addressCount} random addresses:`.green, randomAddresses);

    const defaultAmountToSend = 0.001;
    
    const amountInput = readlineSync.question(
        `How many amount to send ? (default is ${defaultAmountToSend}): `
    );

    const amountToSend = amountInput
        ? parseFloat(amountInput)
        : defaultAmountToSend;

    if (isNaN(amountToSend) || amountToSend <= 0.00001) {
        console.error('Invalid amount. Please enter a value greater than 0.00001.'.red);
    }

    for (const [index, seedOrKey] of seedPharsesOrKeys.entries()) {
        let fromKeypair;
        if (method === '0') {
            fromKeypair = await getKeypairFromSeedPharse(seedOrKey);
        } else {
            fromKeypair = getKeypairFromPrivateKey(seedOrKey);
        }

        console.log(
            `Send SOL from account ${index + 1}: ${fromKeypair.publicKey.toString()}`.yellow
        );

        for (const address of randomAddresses) {
            const toPublicKey = new PublicKey(address);

            try {
                await sendSol(fromKeypair, toPublicKey, amountToSend);
                console.log(`Successfully send ${amountToSend} SOL to ${address}`.green);
            } catch (error) {
                console.error(`Failed to send SOL to ${address}: `, error);
            }
        }
    }
    
})();