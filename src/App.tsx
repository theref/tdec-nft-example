import {
  Cohort,
  DeployedStrategy,
  Enrico,
  MessageKit,
  Strategy,
  tDecDecrypter,
  PolicyMessageKit,
  ConditionSet,
} from "@nucypher/nucypher-ts";
import React, { useState } from "react";
import { Mumbai, useEthers } from "@usedapp/core";
import { ethers } from "ethers";

import { NftConditionBuilder } from "./NftConditionBuilder";
import { Encrypt } from "./Encrypt";
import { Decrypt } from "./Decrypt";
import { switchToNetwork } from "./web3";

declare let window: any;

export default function App() {
  const { activateBrowserWallet, deactivate, account, library } = useEthers();

  const [shares, setShares] = useState(1);
  const [threshold, setThreshold] = useState(1);

  const [strategy, setStrategy] = useState(undefined as Strategy | undefined);
  const [deployedStrategy, setDeployedStrategy] = useState(
    undefined as DeployedStrategy | undefined
  );

  // tDec Entities
  const [encrypter, setEncrypter] = useState(undefined as Enrico | undefined);
  const [decrypter, setDecrypter] = useState(
    undefined as tDecDecrypter | undefined
  );

  const [conditions, setConditions] = useState(new ConditionSet([]));

  async function deployStrategy() {
    await switchToNetwork(Mumbai.chainId);
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    console.log(threshold, shares);
    const cohortConfig = {
      threshold,
      shares,
      porterUri: "http://143.198.239.218",
    };

    const goodUrsulas = ["0xCe692F6fA86319Af43050fB7F09FDC43319F7612"];
    const cohort = await Cohort.create(cohortConfig, goodUrsulas as unknown[] as never[]); // TODO: remove after updating nucypher-ts
    console.log("Cohort created: ", cohort);
    const strategy = Strategy.create(
      cohort,
      new Date(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    );
    setStrategy(strategy);

    console.log("Strategy created: ", strategy);

    const deployedStrategy = await strategy.deploy("test", web3Provider);
    setDeployedStrategy(deployedStrategy);

    // setDeployedStrategy(await strategy?.deploy('test', new ethers.providers.Web3Provider(window.ethereum)));
    setEncrypter(deployedStrategy?.encrypter);
    setDecrypter(deployedStrategy?.decrypter);

    console.log("Deployed Strategy created: ", deployedStrategy);
  }

  // Encrypt message vars
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [encryptedMessage, setEncryptedMessage] = useState(
    undefined as MessageKit | undefined
  );

  // Decrypt message vars
  const [decryptionEnabled, setDecryptionEnabled] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [decryptionErrors, setDecryptionErrors] = useState([] as string[]);

  // useEffect(() => {
  //   const porterUri = "https://porter-ibex.nucypher.community";

  //   const make = async () => {
  //     // const decrypter = await makeTDecDecrypter(configLabel, porterUri);
  //     // const encrypter = await makeTDecEncrypter(configLabel);
  //     setDecrypter(decrypter);
  //     setEncrypter(encrypter);
  //   };
  //   make().catch(console.error);
  // }, []);

  const encryptMessage = (plaintext: string) => {
    if (!encrypter || !conditions) {
      return;
    }
    encrypter.conditions = conditions;
    const encryptedMessage = encrypter.encryptMessage(plaintext);

    setEncryptedMessage(encryptedMessage);
    setDecryptionEnabled(true);
  };

  const decryptMessage = async (ciphertext: MessageKit) => {
    setDecryptedMessage("");
    setDecryptionErrors([]);

    if (!decrypter || !conditions || !library) {
      return;
    }

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const conditionContext = conditions.buildContext(web3Provider);

    // More extensive flow with manual error handling
    const retrievedMessages = await decrypter.retrieve(
      [ciphertext],
      conditionContext
    );
    const decryptedMessages = retrievedMessages.map((mk: PolicyMessageKit) => {
      if (mk.isDecryptableByReceiver()) {
        return decrypter.decrypt(mk);
      }

      // If we are unable to decrypt, we may inspect the errors and handle them
      if (Object.values(mk.errors).length > 0) {
        const ursulasWithErrors: string[] = Object.entries(mk.errors).map(
          ([address, error]) => `${address} - ${error}`
        );
        setDecryptionErrors(ursulasWithErrors);
      } else {
        setDecryptionErrors([]);
      }
      return new Uint8Array([]);
    });

    setDecryptedMessage(new TextDecoder().decode(decryptedMessages[0]));
  };

  if (!account) {
    return (
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={deactivate}> Disconnect Wallet </button>
        {account && <p>Account: {account}</p>}
        <p>
          Access{" "}
          <a href={"https://wesleytw.github.io/epic-nft-dist/"} target="_blank">
            the NFT Faucet
          </a>{" "}
          if needed
        </p>
      </div>

      <div>
        <h2>Build Strategy</h2>
        <label htmlFor="thresholds">Select Threshold:</label>
        <input
          id="thresholds"
          type="number"
          defaultValue={1}
          onChange={(e) => setThreshold(parseInt(e.currentTarget.value))}
        />

        <label htmlFor="shares">Select Shares:</label>
        <input
          id="shares"
          type="number"
          defaultValue={1}
          onChange={(e) => setShares(parseInt(e.currentTarget.value))}
        />
      </div>

      <button onClick={deployStrategy}>Deploy Strategy</button>

      <NftConditionBuilder
        enabled={encryptionEnabled}
        conditions={conditions}
        setConditions={setConditions}
      />

      {conditions.conditions.length > 0 && encryptedMessage && (
        <>
          <Encrypt
            enabled={encryptionEnabled}
            encrypt={encryptMessage}
            encryptedMessage={encryptedMessage}
          />
          <Decrypt
            enabled={decryptionEnabled}
            decrypt={decryptMessage}
            decryptedMessage={decryptedMessage}
            decryptionErrors={decryptionErrors}
          />
        </>
      )}
    </div>
  );
}
