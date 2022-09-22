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

  const SQUARE_NFT_RINKEBY_ADDRESS =
    "0x18df9f6c606B2C4400D69Eeed2684cd1Aa501b8D";
  const [contractAddress, setContractAddress] = useState(
    SQUARE_NFT_RINKEBY_ADDRESS
  );
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

  const makeInput = (
    type: "text" | "number",
    onChange = (e: any) => console.log(e),
    defaultValue?: string | number
  ) => (
    <input
      type={type}
      onChange={(e: any) => onChange(e.target.value)}
      defaultValue={defaultValue}
    />
  );

  const ContractAddressInput = makeInput(
    "text",
    setContractAddress,
    SQUARE_NFT_RINKEBY_ADDRESS
  );
  const TokenIdInput = makeInput("number", setTokenId);

  const makeEvmCondition = (): Condition => {
    // TODO: Capitalizing is required
    const capitalizeFirstLetter = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1);
    const chain = capitalizeFirstLetter(library.network.name);
    return new Conditions.EvmCondition({
      contractAddress,
      chain,
      standardContractType: "ERC721",
      method: "ownerOf",
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

  const ConditionList =
    conditions?.conditions.length > 0 ? (
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
      <h2>Step 1 - Create A Conditioned Access Policy</h2>
      <div>
        <div>
          <h3>Customize your NFT-Condition</h3>
          <div>
            <p>ERC721 Contract Address {ContractAddressInput}</p>
            <p>TokenId {TokenIdInput}</p>
          </div>
          <button onClick={onCreateCondition}>Create</button>
        </div>
        {ConditionList}
      </div>
    </>
  );
};
