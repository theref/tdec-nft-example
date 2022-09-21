import type { MessageKit } from "@nucypher/nucypher-ts";
import React, { useState } from "react";

interface Props {
  enabled: boolean;
  encryptedMessage?: MessageKit;
  encrypt: (value: string) => void;
}

export const EnricoEncrypts = ({
  encrypt,
  encryptedMessage,
  enabled
}: Props) => {
  if (!enabled) {
    return <></>;
  }

  const [plaintext, setPlaintext] = useState("plaintext");

  const onClick = () => encrypt(plaintext);

  const CiphertextContent = () => {
    if (!encryptedMessage) {
      return <></>;
    }

    const encodedEncryptedMessage = Buffer
      .from(encryptedMessage.toBytes())
      .toString("base64");
    return (
      <div>
        <h3>Encrypted message:</h3>
        <pre className="encryptedMessage">{encodedEncryptedMessage}</pre>
      </div>
    );
  };

  return (
    <div>
      <h3>Step 2 - Set conditions and Encrypt a message</h3>
      <input
        id={"encryptionInput"}
        type="string"
        value={plaintext}
        onChange={(e) => setPlaintext(e.currentTarget.value)}
      />
      <button onClick={onClick}>Encrypt</button>
      {CiphertextContent()}
    </div>
  );
};
