// Contract addresses
export const BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET =
  '0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5';
export const BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_TESTNET =
  '0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581';

// for transfer needed
export const BASENAMES_BASE_REGISTRAR_ADDRESS_MAINNET =
  '0x03c4738Ee98aE44591e1A4A4F3CaB6641d95DD9a';
export const BASENAMES_BASE_REGISTRAR_ADDRESS_TESTNET =
  '0xA0c70ec36c010B55E3C434D6c6EbEEC50c705794';

export const L2_RESOLVER_ADDRESS_MAINNET =
  '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';
export const L2_RESOLVER_ADDRESS_TESTNET =
  '0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA';

// Default registration duration (1 year in seconds)
export const REGISTRATION_DURATION = 31557600n;

// Relevant ABI for L2 Resolver Contract.
export const L2_RESOLVER_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'address', name: 'a', type: 'address' },
    ],
    name: 'setAddr',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'string', name: 'newName', type: 'string' },
    ],
    name: 'setName',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'address', name: 'addr', type: 'address' },
    ],
    name: 'setAddr',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Relevant ABI for Basenames Registrar Controller Contract.
export const REGISTRAR_ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'resolver',
            type: 'address',
          },
          {
            internalType: 'bytes[]',
            name: 'data',
            type: 'bytes[]',
          },
          {
            internalType: 'bool',
            name: 'reverseRecord',
            type: 'bool',
          },
        ],
        internalType: 'struct RegistrarController.RegisterRequest',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// added ERC721 Transfer Methods, can be integrated into the REGISTRAR_ABI
export const BASE_REGISTRAR_TRANSFER_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'reclaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Check approval status
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Approval Methods
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Helper Methods
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'available',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'reclaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
