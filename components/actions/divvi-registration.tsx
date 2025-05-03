'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { stringToHex } from 'viem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { useActions } from '@/hooks/use-actions';
import { toast } from 'sonner';

// Divvi V0 Registry Contract on Base
const REGISTRY_CONTRACT_ADDRESS = '0xBa9655677f4E42DD289F5b7888170bC0c7dA8Cdc';
const REFERRER_ID = 'papa'; // Your referral ID

// Full Registry Contract ABI
const registryContractAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint48', name: 'transferDelay', type: 'uint48' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'AccessControlBadConfirmation', type: 'error' },
  {
    inputs: [{ internalType: 'uint48', name: 'schedule', type: 'uint48' }],
    name: 'AccessControlEnforcedDefaultAdminDelay',
    type: 'error',
  },
  { inputs: [], name: 'AccessControlEnforcedDefaultAdminRules', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'defaultAdmin', type: 'address' },
    ],
    name: 'AccessControlInvalidDefaultAdmin',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'bytes32', name: 'neededRole', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'protocolId', type: 'bytes32' },
      { internalType: 'bytes32', name: 'referrerId', type: 'bytes32' },
    ],
    name: 'ReferrerNotRegistered',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'bits', type: 'uint8' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'SafeCastOverflowedUintDowncast',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'protocolId', type: 'bytes32' },
      { internalType: 'bytes32', name: 'referrerId', type: 'bytes32' },
      { internalType: 'address', name: 'userAddress', type: 'address' },
    ],
    name: 'UserAlreadyRegistered',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'DefaultAdminDelayChangeCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint48',
        name: 'newDelay',
        type: 'uint48',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'effectSchedule',
        type: 'uint48',
      },
    ],
    name: 'DefaultAdminDelayChangeScheduled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'DefaultAdminTransferCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'acceptSchedule',
        type: 'uint48',
      },
    ],
    name: 'DefaultAdminTransferScheduled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'protocolId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'referrerId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'userAddress',
        type: 'address',
      },
    ],
    name: 'ReferralRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'referrerId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'protocolIds',
        type: 'bytes32[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'rewardRates',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'rewardAddress',
        type: 'address',
      },
    ],
    name: 'ReferrerRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptDefaultAdminTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newAdmin', type: 'address' }],
    name: 'beginDefaultAdminTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cancelDefaultAdminTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint48', name: 'newDelay', type: 'uint48' }],
    name: 'changeDefaultAdminDelay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultAdmin',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultAdminDelay',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultAdminDelayIncreaseWait',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'providerId', type: 'bytes32' }],
    name: 'getProtocols',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'protocolId', type: 'bytes32' }],
    name: 'getReferrers',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'referrerId', type: 'bytes32' }],
    name: 'getRewardAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'protocolId', type: 'bytes32' },
      { internalType: 'bytes32', name: 'referrerId', type: 'bytes32' },
    ],
    name: 'getRewardRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'protocolId', type: 'bytes32' },
      { internalType: 'bytes32', name: 'referrerId', type: 'bytes32' },
    ],
    name: 'getUsers',
    outputs: [
      { internalType: 'address[]', name: '', type: 'address[]' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'userAddress', type: 'address' },
      { internalType: 'bytes32[]', name: 'protocolIds', type: 'bytes32[]' },
    ],
    name: 'isUserRegistered',
    outputs: [{ internalType: 'bool[]', name: '', type: 'bool[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingDefaultAdmin',
    outputs: [
      { internalType: 'address', name: 'newAdmin', type: 'address' },
      { internalType: 'uint48', name: 'schedule', type: 'uint48' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingDefaultAdminDelay',
    outputs: [
      { internalType: 'uint48', name: 'newDelay', type: 'uint48' },
      { internalType: 'uint48', name: 'schedule', type: 'uint48' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'referrerId', type: 'bytes32' },
      { internalType: 'bytes32[]', name: 'protocolIds', type: 'bytes32[]' },
    ],
    name: 'registerReferrals',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'referrerId', type: 'bytes32' },
      { internalType: 'bytes32[]', name: 'protocolIds', type: 'bytes32[]' },
      { internalType: 'uint256[]', name: 'rewardRates', type: 'uint256[]' },
      { internalType: 'address', name: 'rewardAddress', type: 'address' },
    ],
    name: 'registerReferrer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rollbackDefaultAdminDelay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function DivviRegistrationAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [txHash, setTxHash] = useState('');
  const { completeAction } = useActions();

  // Check if user is registered with Aerodrome protocol
  const { data: registrationStatus, refetch: refetchRegistrationStatus } =
    useReadContract({
      address: REGISTRY_CONTRACT_ADDRESS,
      abi: registryContractAbi,
      functionName: 'isUserRegistered',
      args: address
        ? [address, [stringToHex('aerodrome', { size: 32 })]]
        : undefined,
      chainId: base.id,
    });

  // Register user with Divvi Protocol
  const { writeContract, data: writeData } = useWriteContract();

  // Update local state when registration status changes
  useEffect(() => {
    if (registrationStatus?.[0]) {
      setIsRegistered(true);
      if (writeData && typeof writeData === 'string') {
        setTxHash(writeData);
      }
    }
  }, [registrationStatus, writeData]);

  const handleRegister = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      // If user is not registered, register them
      if (!registrationStatus?.[0]) {
        toast.info('Registering you with Divvi V0 for rewards...');

        try {
          // In wagmi v2, writeContract returns void, not a transaction hash
          // The transaction hash will be available in the data property of useWriteContract
          await writeContract({
            address: REGISTRY_CONTRACT_ADDRESS,
            abi: registryContractAbi,
            functionName: 'registerReferrals',
            args: [
              stringToHex(REFERRER_ID, { size: 32 }),
              [stringToHex('aerodrome', { size: 32 })],
            ],
            chainId: base.id,
          });

          toast.success('Registration transaction submitted!');
          // The transaction hash will be set in the useEffect that watches writeData
        } catch (error) {
          console.error('Transaction error:', error);
          toast.error('Failed to submit transaction');
        }

        // Wait for the transaction to be mined and then refetch the registration status
        setTimeout(async () => {
          await refetchRegistrationStatus();
        }, 5000);
      } else {
        toast.info('You are already registered with Divvi V0!');
        setIsRegistered(true);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!address || !txHash) return;

    setIsLoading(true);
    try {
      // Get the action ID from the database
      const response = await fetch('/api/actions/by-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Register with Divvi V0' }),
      });

      if (!response.ok) {
        throw new Error('Failed to get action ID');
      }

      const { id } = await response.json();

      // Complete the action
      await completeAction(id, {
        txHash,
        platform: 'divvi',
        completedAt: new Date().toISOString(),
      });

      toast.success('Registration completed successfully!');
      setIsRegistered(true);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">
        Register with Stable Station
      </h3>
      <p className="text-gray-600 mb-6">
        Register to unlock features on base you swap on Aerodrome and other
        protocols.
      </p>

      <div className="mb-6">
        <h4 className="font-medium mb-2">About Divvi V0:</h4>
        <p className="text-sm text-gray-600 mb-2">
          Stable Station is a platform that enables portfolio management,
          stables swaps, insights and analysis. Registration requires a one-time
          on-chain transaction.
        </p>
        <div className="flex items-center text-sm text-blue-600">
          <a
            href="https://stable-station.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
          >
            Learn more about Stable Station
            <ExternalLink className="ml-1 size-3" />
          </a>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Rewards:</h4>
        <p className="text-green-600 font-medium">
          Earn rewards through Divvi Protocol when using Aerodrome
        </p>
      </div>

      {isRegistered ? (
        <div className="bg-green-50 p-4 rounded-md flex items-center gap-3 mb-6">
          <CheckCircle className="size-5 text-green-600" />
          <div>
            <h3 className="font-medium">Successfully Registered!</h3>
            <p className="text-sm text-gray-600">
              You are now registered with Stable Station.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={handleRegister}
            disabled={isLoading || !address}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Register with Stable Station'
            )}
          </Button>

          {txHash && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                Transaction submitted! Click the button below to complete the
                registration.
              </p>

              <Button
                onClick={handleComplete}
                disabled={isLoading || !address}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {!address && (
        <p className="mt-2 text-sm text-gray-500">
          Please connect your wallet to continue
        </p>
      )}
    </Card>
  );
}
