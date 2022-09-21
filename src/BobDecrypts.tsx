import { MessageKit } from "@nucypher/nucypher-ts";
import React, { useState } from "react";

interface Props {
  enabled: boolean;
  decrypt: (ciphertext: MessageKit) => void;
  decryptedMessage: string;
}

export const BobDecrypts = ({ decrypt, decryptedMessage, enabled }: Props) => {
  const [ciphertext, setCiphertext] = useState("");

  if (!enabled) {
    return <></>;
  }

  const onDecrypt = () => {
    const b64decoded = Buffer.from(ciphertext, "base64");
    decrypt(MessageKit.fromBytes(b64decoded));
  };

  return (
    <div>
      <h3>Step 3 - Bob decrypts encrypted message</h3>
      <input
        value={ciphertext}
        placeholder="Enter encrypted message"
        onChange={(e) => setCiphertext(e.currentTarget.value)}
      />
      <button onClick={onDecrypt}>Decrypt</button>
      {decryptedMessage ?? ""}
    </div>
  );
};
