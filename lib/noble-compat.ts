// Noble packages compatibility
import { sha256 } from '@noble/hashes/sha256';
import { keccak256 } from '@noble/hashes/sha3';
import * as utils from '@noble/hashes/utils';

export { sha256, keccak256 };
export const { 
  bytesToHex, 
  hexToBytes, 
  concatBytes, 
  utf8ToBytes,
  randomBytes,
  isBytes 
} = utils;

// Add missing exports that @noble/curves expects
export const abytes = (data: Uint8Array): Uint8Array => data;
export const bytesToUtf8 = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);
export const ahash = (data: Uint8Array): Uint8Array => data;
// Noble packages compatibility layer
export * from '@noble/hashes/utils';

// Add missing exports that @noble/curves expects
export const abytes = (data: any): Uint8Array => {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return new TextEncoder().encode(data);
  return data;
};

export const bytesToUtf8 = (bytes: Uint8Array): string => {
  if (bytes instanceof Uint8Array) return new TextDecoder().decode(bytes);
  return String(bytes);
};

export const ahash = (data: any) => {
  if (typeof data === 'function') return data;
  return () => data;
};
