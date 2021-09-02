import crypto from 'crypto';
import path from 'path';
const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

interface IMessage {
  _id: string;
  sender: string;
  content: {
    iv: string;
    content: string;
  };
  date?: Date;
  __v: number;
}

export class CryptoUtil {
  constructor(private encryptionSecret: string) {}

  /**
   * Encrypts the passed text and returns the iv and encrypted content
   *
   * @param   {String} text - plain text that needs to be encrypted
   * @return  { iv: String, content: String }
   */

  encrypt(text: string): { iv: string; content: string } {
    const cipher = crypto.createCipheriv(algorithm, this.encryptionSecret, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    };
  }

  /**
   * Decrypts the encrypted message and returns the decrypted data
   *
   * @param   {Object} Hash - an object with the iv and content
   * @return  {String} text - plain text data
   */

  decrypt(hash: { iv: string; content: string }): string {
    const decipher = crypto.createDecipheriv(
      algorithm,
      this.encryptionSecret,
      Buffer.from(hash.iv, 'hex')
    );

    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, 'hex')),
      decipher.final(),
    ]);
    return decrpyted.toString();
  }

  /**
   * decrypt an array of encrypted messages
   *
   * @param {IMessage[]} Messages
   * @returns {Array} Decrypted
   */

  decryptMessageArray(messages: IMessage[]) {
    const msgs: any = [];
    messages.forEach((message: IMessage) => {
      const decrypted = this.decrypt(message.content);
      msgs.push({
        _id: message._id,
        sender: message.sender,
        date: message.date,
        content: decrypted,
      });
    });
    return msgs;
  }
}
