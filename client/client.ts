import * as anchor from "@coral-xyz/anchor";
import {initializeKeypair} from "./initializeKeypair"
import {getAccount, getOrCreateAssociatedTokenAccount,} from "@solana/spl-token";
import {PublicKey} from "@solana/web3.js";
import {keypairIdentity, Metaplex, token} from "@metaplex-foundation/js";
import type {TokenVault} from "../target/types/token_vault";
import {TokenStandard} from "@metaplex-foundation/mpl-token-metadata";

const program = anchor.workspace.TokenVault as anchor.Program<TokenVault>;
// const keypair = anchor.web3.Keypair.generate();
// const mintAuthority = (program.provider as anchor.AnchorProvider).wallet
const decimals = 9;

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

async function main() {
    const user = await initializeKeypair(program.provider.connection);
    // const user = await initializeKeypair(anchor.getProvider().connection);
    console.log(user.publicKey.toBase58())

    let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_account_owner_pda")],
        program.programId
    );

    const metaplex = new Metaplex(program.provider.connection).use(
        keypairIdentity(user)
    );

    const createdSFT = await metaplex.nfts().createSft({
        uri: "https://storage.googleapis.com/lane-misc/spudcoinmeta",
        name: "SpudCoin",
        symbol: "SPUD",
        sellerFeeBasisPoints: 0,
        updateAuthority: user,
        mintAuthority: user,
        decimals: decimals,
        tokenStandard: TokenStandard.Fungible,
        isMutable: true,
    });

    console.log(
        "Creating semi fungible spl token with address: " + createdSFT.sft.address
    );

    const mintDecimals = Math.pow(10, decimals);

    let mintResult = await metaplex.nfts().mint({
        nftOrSft: createdSFT.sft,
        authority: user,
        toOwner: user.publicKey,
        amount: token(100 * mintDecimals),
    });

    console.log("Mint to result: " + mintResult.response.signature);

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        user,
        createdSFT.mintAddress,
        user.publicKey,
    );

    console.log("tokenAccount: " + tokenAccount.address);
    console.log("TokenAccountOwnerPda: " + tokenAccountOwnerPda);

    let tokenAccountInfo = await getAccount(program.provider.connection, tokenAccount.address);
    console.log(
        "Owned token amount: " + tokenAccountInfo.amount / BigInt(mintDecimals)
    );
    // let [tokenVault] = PublicKey.findProgramAddressSync(
    //     [Buffer.from("token_vault"), createdSFT.mintAddress.toBuffer()],
    //     program.programId
    // );
    // console.log("VaultAccount: " + tokenVault);
    //
    let confirmOptions = {
        skipPreflight: true,
    };

    let txHash = await program.methods
        .initialize()
        .accounts({
            tokenAccountOwnerPda: tokenAccountOwnerPda,
            // vaultTokenAccount: tokenVault,
            senderTokenAccount: tokenAccount.address,
            mintOfTokenBeingSent: createdSFT.mintAddress,
            signer: program.provider.publicKey,
        })
        .rpc(confirmOptions);

    console.log(`Initialize`);
    await logTransaction(txHash);

    // console.log(`Vault initialized.`);
    console.log(
        "Owned token amount: " + tokenAccountInfo.amount / BigInt(mintDecimals)
    );
    // tokenAccountInfo = await getAccount(program.provider.connection, tokenVault);
    // console.log(
    //     "Vault token amount: " + tokenAccountInfo.amount / BigInt(mintDecimals)
    // );

    // tokenAccountInfo = await getAccount(program.provider.connection, tokenAccount.address);
    // console.log(
    //     "Owned token amount: " + tokenAccountInfo.amount / BigInt(mintDecimals)
    // );
}

async function logTransaction(txHash) {
  const { blockhash, lastValidBlockHeight } =
    await program.provider.connection.getLatestBlockhash();

  await program.provider.connection.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txHash,
  });

  console.log(
    `Solana Explorer: https://explorer.solana.com/tx/${txHash}?cluster=devnet`
  );
}