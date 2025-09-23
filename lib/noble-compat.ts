// Noble packages compatibility layer
export * from '@noble/hashes/utils';

// Add missing exports that @noble/curves expects
export const abytes = (data: any): any => {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return new TextEncoder().encode(data);
  return data;
};

export const bytesToUtf8 = (bytes: any): string => {
  if (bytes instanceof Uint8Array) return new TextDecoder().decode(bytes);
  return String(bytes);
};

export const ahash = (data: any): any => {
  if (typeof data === 'function') return data;
  return data;
};
