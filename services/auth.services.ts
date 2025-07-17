import crypto from 'crypto';
import type { JwtPayload, Secret } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import config from './config';


export interface AuthorizeConfig {
  secret: string;
  token_secret: string;
  algorithm: string;
  encoding_typeOne: BufferEncoding;
  encoding_typeTwo: BufferEncoding;
}

const cipherKey = crypto
  .createHash('sha256')
  .update(config.AUTHORIZE.SECRET!)
  .digest();

const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    config.AUTHORIZE.ALGORITHM!,
    cipherKey,
    iv,
  );
  let encrypted = cipher.update(
    text,
    config.AUTHORIZE.ENCODING_TYPE_ONE as BufferEncoding,
  );
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (text: string): string => {
  const paramText = decodeURIComponent(text);
  const textParts = paramText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    config.AUTHORIZE.ALGORITHM!,
    cipherKey,
    iv,
  );
  const decrypted = Buffer.concat([
    decipher.update(
      encryptedText as unknown as string,
      config.AUTHORIZE.ENCODING_TYPE_ONE as BufferEncoding,
    ),
    decipher.final(),
  ]);
  return decrypted.toString(
    config.AUTHORIZE.ENCODING_TYPE_TWO as BufferEncoding,
  );
};

const createToken = (
  payload: object,
  secret: Secret,
  expiresIn: string = '1d',
): string => {
  // Generate a unique ID for the token (jti)
  const tokenId: string = crypto.randomUUID();

  return jwt.sign(
    {
      ...payload,
      jti: tokenId,
      iat: Math.floor(Date.now() / 1000),
    },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] },
  );
};

const verifyToken = <T extends JwtPayload>(
  token: string,
  secret: Secret,
): T => {
  return jwt.verify(token, secret) as T;
};

const authorizeServices = {
  encrypt,
  decrypt,
  createToken,
  verifyToken,
};

export default authorizeServices;