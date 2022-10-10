import { Rinkeby } from "@usedapp/core";
import { ethers } from "ethers";

export const WEB3_PROVIDER_URL =
  "https://hardworking-clean-gas.rinkeby.discover.quiknode.pro/17628d541fafc8312c89998c94610cf3c76613de/";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const addAltRinkebyNetwork = async () => {
  const provider = window.ethereum;
  if (!provider) {
    return;
  }
  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: Rinkeby.chainId,
          chainName: "Alt Rinkeby",
          rpcUrls: [WEB3_PROVIDER_URL],
          blockExplorerUrls: ["https://rinkeby.etherscan.io"],
          nativeCurrency: {
            symbol: "RinkebyETH",
            decimals: 18,
          },
        },
      ],
    });
  } catch (addError) {
    console.log(addError);
  }
};

export const switchToNetwork = async (chainId: number) => {
  const chainIdHex = ethers.utils.hexValue(chainId);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if ((switchError as { code: number }).code === 4902) {
      console.log(
        "This network is not available in your metamask, please add it"
      );
    }
    console.log("Failed to switch to the network");
  }
};
