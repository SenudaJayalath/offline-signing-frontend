import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  AnchorWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { Program, web3, BN } from "@project-serum/anchor";
import {
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import React, { FC, ReactNode, useMemo } from "react";
import idl from "./idl.json";
import GetProvider from "./utils";

require("./App.css");
require("@solana/wallet-adapter-react-ui/styles.css");

const App: FC = () => {
  return (
    <Context>
      <Content />
    </Context>
  );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content: FC = () => {
  const wallet: AnchorWallet | undefined = useAnchorWallet();


  const a = JSON.stringify(idl);
  const idl_json = JSON.parse(a);

  const program_id = "FeVE25VLH3as5E6emHyFdHsbyxdfgPVrBu1WmEaERUGk";
  const toWalletPubKey = new PublicKey(
    "2A7EimdidgEHsHAVBR6mdixGXMfgkDMQZCZgxecQLRMi"
  );


  async function transferSol() {
    const input = document.getElementById(
      "solInput"
    ) as HTMLInputElement | null;

    if (input != null) {
      const amount = parseFloat(input.value) * LAMPORTS_PER_SOL;

      const provider = GetProvider(wallet);
      if (!provider) {
        throw "Provider Not Set";
      }
      const program = new Program(idl_json, program_id, provider);

      try {
        const tx = await program.transaction.transferSol(new BN(amount), {
          accounts: {
            from: provider?.wallet.publicKey,
            to: toWalletPubKey,
            systemProgram: web3.SystemProgram.programId,
          },
        });
        const latestBlockHash = await provider.connection.getLatestBlockhash();
        tx.recentBlockhash = latestBlockHash.blockhash;
        tx.feePayer = provider?.wallet.publicKey;
        let signed = await provider?.wallet.signTransaction(tx);

         console.log(signed)
      } catch (err) {
        console.log("Transaction Error: ", err);
      }
    } else {
      console.log("Transaction Error: Enter amount of SOL to be transferred");
    }
  }

  return (
    <div className="App">
      <button onClick={transferSol}>Transfer SOL</button>
      <WalletMultiButton />
    </div>
  );
};
