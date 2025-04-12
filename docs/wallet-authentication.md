# Wallet Authentication Flow

This document describes the integrated wallet connection and authentication flow in Stable Station.

## Overview

Stable Station uses a seamless authentication flow that combines wallet connection and Sign-In With Ethereum (SIWE) into a single user experience. This approach provides several benefits:

1. **Improved User Experience**: Users don't need to perform separate wallet connection and authentication steps
2. **Reduced Confusion**: The integrated flow makes it clear that wallet connection and authentication are related
3. **Better Security**: Consistent domain handling prevents domain mismatch errors in MetaMask

## Implementation Details

### Components

- **IntegratedConnectButton**: The main component that handles both wallet connection and SIWE authentication
- **ConnectKitProvider**: Configured with custom options for a better user experience
- **auth-actions.ts**: Server-side functions for SIWE challenge generation and verification

### Authentication Flow

1. **Initial Connection**:
   - User clicks "Connect Wallet" button
   - ConnectKit modal appears for wallet selection
   - User selects and connects their wallet

2. **Automatic SIWE**:
   - Once wallet is connected, SIWE authentication is automatically triggered
   - User receives a signature request in their wallet
   - Clear messaging informs the user about the purpose of the signature

3. **Session Management**:
   - After successful authentication, a session is created
   - Session is stored in an encrypted cookie
   - User remains authenticated until session expires or they log out

## Error Handling

The implementation includes comprehensive error handling for various scenarios:

- **Domain Mismatch**: Clear error message if the domain in the SIWE message doesn't match the site
- **User Rejection**: Friendly message if the user rejects the signature request
- **Popup Blocking**: Guidance if browser popup blocking prevents wallet connection
- **Network Issues**: Appropriate error messages for network-related failures

## Configuration

The authentication flow relies on proper environment configuration:

- `NEXT_PUBLIC_APP_URL`: Must be set to the actual domain users access the site from
- `SESSION_SECRET`: Used for encrypting session cookies
- `AUTH_SECRET`: Used for additional security measures

## Troubleshooting

If users experience authentication issues:

1. **Check Browser Console**: Look for detailed error messages
2. **Verify Domain Configuration**: Ensure NEXT_PUBLIC_APP_URL matches the actual domain
3. **Clear Cookies**: Have users clear cookies and try again
4. **Check Wallet Connection**: Ensure wallet is properly connected before authentication
5. **Network Issues**: Check if the user is on the correct network

## Security Considerations

- SIWE messages include a statement explaining the purpose of the signature
- Domain validation prevents phishing attacks
- Session cookies are encrypted and have appropriate expiration
- Clear error messages help users identify potential security issues
