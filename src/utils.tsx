import {
    AnchorWallet,
  } from "@solana/wallet-adapter-react";
  import { Connection,clusterApiUrl } from "@solana/web3.js";
  import {  Provider } from "@project-serum/anchor";  
  
export default function GetProvider(wallet:AnchorWallet|undefined) {  
    if (!wallet) {
      return null;
    }
    // const network = "http://127.0.0.1:8899";
    // const connection = new Connection(network, "processed");
    const connection = new Connection( clusterApiUrl('devnet'), 'confirmed');
   

    const provider = new Provider(connection, wallet, {
      preflightCommitment: "processed",
    });
    return provider;
  }