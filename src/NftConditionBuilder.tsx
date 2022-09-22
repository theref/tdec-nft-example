import { ConditionSet, Condition, Conditions } from "@nucypher/nucypher-ts";
import React, { useState } from "react";

import { useEthers } from "@usedapp/core";

interface Props {
  conditions?: ConditionSet;
  setConditions: (value: ConditionSet) => void;
  enabled: boolean;
}

export const NftConditionBuilder = ({
  conditions,
  setConditions,
  enabled,
}: Props) => {
  const { library } = useEthers();

  if (!enabled || !library) {
    return <></>;
  }

  const NFT_CONTRACT_TYPES = ["ERC721", "ERC1155"];
  const { METHODS_PER_CONTRACT_TYPE } = Conditions.EvmCondition;

  const [nftContractType, setNftContractType] = useState(NFT_CONTRACT_TYPES[0]);
  const [contractMethod, setContractMethod] = useState(
    METHODS_PER_CONTRACT_TYPE[nftContractType][0]
  );
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");

  const makeDropdown = (
    items: readonly string[],
    onChange = (e: any) => console.log(e)
  ) => {
    const optionItems = items.map((elem, index) => (
      <option key={index} value={elem}>
        {elem}
      </option>
    ));
    return (
      <select onChange={(e) => onChange(e.target.value)}>{optionItems}</select>
    );
  };
  const onSetContractMethod = (method: string) => {
    setContractMethod(method);
  };

  const NftContractTypeDropdown = makeDropdown(
    NFT_CONTRACT_TYPES,
    setNftContractType
  );
  const ContractMethodDropdown = makeDropdown(
    METHODS_PER_CONTRACT_TYPE[nftContractType],
    onSetContractMethod
  );

  const makeInput = (
    type: "text" | "number",
    onChange = (e: any) => console.log(e)
  ) => <input type={type} onChange={(e: any) => onChange(e.target.value)} />;

  const ContractAddressInput = makeInput("text", setContractAddress);
  const TokenIdInput = makeInput("number", setTokenId);

  const makeEvmCondition = (): Condition => {
    // TODO: Capitalizing is required
    const capitalizeFirstLetter = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1);
    const chain = capitalizeFirstLetter(library.network.name);
    return new Conditions.EvmCondition({
      contractAddress,
      chain,
      standardContractType: nftContractType,
      method: contractMethod,
      parameters: [tokenId],
      returnValueTest: {
        comparator: "==",
        value: ":userAddress",
      },
    });
  };

  const onCreateCondition = (e: any) => {
    e.preventDefault();
    setConditions(new ConditionSet([makeEvmCondition()]));
  };

  const ConditionList = conditions ? (
    <div>
      <h3>Condition JSON Preview</h3>
      <pre>
        {conditions.conditions.map((condition, index) => (
          <div key={index}>
            {JSON.stringify((condition as Condition).value, null, 2)}
          </div>
        ))}
      </pre>
    </div>
  ) : (
    <></>
  );

  return (
    <>
      <h2>Step 1 - Create A Condition Based Policy</h2>
      <div>
        <div>
          <h3>Create An NFT-Condition</h3>
          <div>
            <p>Contract Address {ContractAddressInput}</p>
            <p>NFT Contract Type {NftContractTypeDropdown}</p>
            <p>Method {ContractMethodDropdown}</p>
            <p>TokenId {TokenIdInput}</p>
          </div>
          <button onClick={onCreateCondition}>Create</button>
        </div>
        {ConditionList}
      </div>
    </>
  );
};
