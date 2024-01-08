import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { clusterApiUrl } from "@solana/web3.js";


export interface Cluster {
  name: string;
  endpoint: string;
  network: WalletAdapterNetwork;
}


export function getCluster(cluster: WalletAdapterNetwork): Cluster {
  switch (cluster) {
    case WalletAdapterNetwork.Mainnet:
      return {
        name: "Mainnet Beta",
        endpoint: clusterApiUrl("mainnet-beta"),
        network: WalletAdapterNetwork.Mainnet,
      };
    case WalletAdapterNetwork.Testnet:
      return {
        name: "Testnet",
        endpoint: clusterApiUrl("testnet"),
        network: WalletAdapterNetwork.Testnet,
      };
    case WalletAdapterNetwork.Devnet:
      return {
        name: "Devnet",
        endpoint: clusterApiUrl("devnet"),
        network: WalletAdapterNetwork.Devnet,
      };
    default:
      return {
        name: "Devnet",
        endpoint: clusterApiUrl("devnet"),
        network: WalletAdapterNetwork.Devnet,
      };
  }
}