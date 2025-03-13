# Perpetua - Blockchain-Based Voting and Token Governance Platform

<div align="center">
  <img src="https://raw.githubusercontent.com/Perpetua-tech/Perpetua/main/docs/assets/images/perpetua_logo.svg" alt="Perpetua Logo" width="250">
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Website](https://img.shields.io/badge/Website-Perpetua.ltd-blue)](https://Perpetua.ltd)
  [![Twitter](https://img.shields.io/badge/Twitter-@PerpetuaLtd-blue)](https://x.com/PerpetuaLtd/)
  [![GitHub](https://img.shields.io/badge/GitHub-Perpetua--tech-blue)](https://github.com/Perpetua-tech/Perpetua)
  [![Solana](https://img.shields.io/badge/Solana-Blockchain-blueviolet)](https://solana.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
</div>

## Overview

Perpetua is a comprehensive blockchain-based platform that combines governance, token management, and voting capabilities on the Solana blockchain. It enables community-driven decision making through a transparent asset management system with innovative token delegation mechanisms.

## Key Features

- **Token-based Voting System**: Voting power derived from tokens held and staked
- **Token Locking Mechanism**: Increase voting weight by locking tokens for specified periods
- **Voting Power Delegation**: Delegate voting power to other users
- **Governance Proposals**: Create and vote on community proposals
- **On-chain Voting Verification**: Verified voting through Solana blockchain
- **Transparent Governance**: Community-driven decision making through DAO

## System Architecture

Perpetua employs a modern, scalable architecture designed for performance, security, and transparent governance:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Applications                          │
│                                                                     │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│   │   Web Interface │   │   Wallet        │   │   Admin Portal  │   │
│   │   (React/Next)  │   │   Integration   │   │                 │   │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API Gateway                               │
│                                                                     │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│   │  Authentication │   │ Rate Limiting   │   │   API Routing   │   │
│   │  & Authorization│   │ & Throttling   │   │   & Validation  │   │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Backend Services                             │
│                                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│ │ Token       │ │ User        │ │ Governance  │ │ Comment     │    │
│ │ Service     │ │ Service     │ │ Service     │ │ Service     │    │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Blockchain Layer                              │
│                                                                     │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│   │ Token Contract  │   │ Governance      │   │ Voting          │   │
│   │ Management      │   │ Contract        │   │ Verification    │   │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                  │
│                                                                     │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│   │   PostgreSQL    │   │     Redis       │   │ Solana          │   │
│   │   Database      │   │     Cache       │   │ Blockchain      │   │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Technical Stack

### Frontend
- **Framework**: React with Next.js
- **State Management**: SWR for data fetching
- **UI Components**: Material-UI
- **Wallet Integration**: Solana wallet adapter (@solana/wallet-adapter)
- **Blockchain Integration**: @solana/web3.js

### Backend
- **Runtime**: Node.js with Express.js
- **API Infrastructure**: RESTful API endpoints
- **Authentication**: JWT authentication
- **Database**: PostgreSQL with Prisma ORM
- **Error Handling**: Centralized error handling middleware

### Blockchain
- **Network**: Solana (devnet/mainnet)
- **Token Standard**: SPL Token
- **Signature Verification**: Solana transaction verification
- **Wallet Connectivity**: Multiple wallet support (Phantom, Solflare, etc.)

## Core Components

### Token Management System

The token management system provides the foundation for the governance platform:

1. **Token Balance**: Basic voting power derived from token holdings
2. **Token Locking**: Enhanced voting power through time-locked tokens
3. **Delegation**: Ability to delegate voting power to other users

#### Token Locking Implementation

Token locking increases voting power based on lock duration:

```typescript
// Locked token additional power calculation
// Formula: locked token * (1 + locked time coefficient)
const now = new Date();
for (const lock of lockedTokens) {
  // Calculate locked remaining time (days)
  const daysRemaining = Math.max(
    0,
    (lock.unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  // Locked time coefficient: longest locked is 365 days, adding 0.1% weight per day
  const timeBonus = Math.min(daysRemaining / 365, 1) * 0.365; // Maximum 36.5% additional weight
  votingPower += lock.amount * (1 + timeBonus);
}
```

### Governance System

The governance system enables community decision-making:

1. **Proposal Creation**: Users with sufficient voting power can create proposals
2. **Voting Mechanism**: Token-weighted voting on proposals
3. **On-chain Verification**: Optional blockchain verification of votes

#### Voting Power Calculation Flow

```mermaid
graph TD
    A[User Token Balance] --> D[Base Voting Power]
    B[Locked Tokens] --> E[Lock Duration Bonus]
    E --> D
    C[Delegated Tokens] --> D
    D --> F[Total Voting Power]
    F --> G[Governance Actions]
```

### Data Flow

The platform's data flow follows this pattern:

1. **User Authentication**: JWT-based authentication via API gateway
2. **Token Operations**: Balance inquiries, token locking, delegation
3. **Governance Actions**: Proposal creation, voting, commenting
4. **Blockchain Verification**: Optional on-chain verification of key actions

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Blockchain
    
    User->>Frontend: Connect Wallet
    Frontend->>Backend: Authenticate User
    Backend->>Frontend: Return JWT Token
    
    User->>Frontend: Lock Tokens
    Frontend->>Backend: Request Token Lock
    Backend->>Backend: Update Database
    Backend->>Frontend: Confirm Lock
    
    User->>Frontend: Vote on Proposal
    Frontend->>Backend: Submit Vote
    Backend->>Backend: Record Vote in DB
    
    opt On-chain Verification
        Frontend->>Blockchain: Sign Transaction
        Blockchain->>Backend: Verify Signature
        Backend->>Frontend: Confirm Verification
    end
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL database
- Solana CLI tools

### Installation

```bash
# Clone the repository
git clone https://github.com/Perpetua-tech/Perpetua.git
cd Perpetua

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Initialize database
npx prisma migrate dev

# Start development server
npm run dev
```

### Configuration

Key environment variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/perpetua

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
TOKEN_MINT_ADDRESS=your_token_mint_address
```

## Key Features Implementation

### Token Locking

Users can lock their tokens to increase voting power:

```typescript
// Lock tokens to increase voting power
export const lockTokens = async (
  userId: string,
  amount: number,
  durationInDays: number
): Promise<TokenLock> => {
  // Validation checks
  if (amount <= 0) {
    throw new AppError('Lock amount must be greater than 0', 400);
  }

  try {
    // Check user balance
    const userBalance = await getUserBalance(userId);
    if (userBalance < amount) {
      throw new AppError('Insufficient token balance', 400);
    }

    // Calculate unlock date
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + durationInDays);

    // Create lock record
    const tokenLock = await prisma.tokenLock.create({
      data: {
        userId,
        amount,
        lockDate: new Date(),
        unlockDate,
      },
    });

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenBalance: {
          decrement: amount,
        },
      },
    });

    return tokenLock;
  } catch (error) {
    // Error handling
    throw new AppError('Failed to lock tokens', 500);
  }
};
```

### Voting Power Delegation

The delegation system allows users to delegate their voting power:

```typescript
// Delegate voting power to another user
export const delegateVotingPower = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  expiryDate?: Date
): Promise<void> => {
  // Validation
  if (amount <= 0) {
    throw new AppError('Delegate amount must be greater than 0', 400);
  }

  try {
    // Create delegation record
    await prisma.votingPowerDelegation.create({
      data: {
        fromUserId,
        toUserId,
        amount,
        expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Update delegator's balance
    await prisma.user.update({
      where: { id: fromUserId },
      data: {
        tokenBalance: {
          decrement: amount,
        },
      },
    });
  } catch (error) {
    throw new AppError('Failed to delegate voting power', 500);
  }
};
```

### On-chain Voting

The platform supports on-chain voting verification:

```typescript
// On-chain voting function
export const voteOnChain = async (
  wallet: WalletContextState,
  proposalId: string,
  optionId: string
): Promise<string | null> => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or does not support signing');
  }

  try {
    const connection = getConnection();
    
    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey('VoteProgramAddressOrTreasuryWallet'),
        lamports: 1000,
      })
    );

    // Add voting data to memo
    const voteData = JSON.stringify({
      type: 'vote',
      proposalId,
      optionId,
      timestamp: new Date().toISOString(),
    });
    
    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    throw new Error(`Voting transaction failed: ${(error as Error).message}`);
  }
};
```

## Security Considerations

1. **Voting Integrity**: Prevention of double-voting through database constraints
2. **Token Lock Security**: Immutable lock records with clear expiration dates
3. **Delegation Safety**: Revocation capabilities for delegated voting power
4. **Wallet Protection**: No sensitive key material transmitted to backend
5. **Input Validation**: Comprehensive validation on all endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Development Team
- Community Contributors

## Contact

- Website: [Perpetua.ltd](https://Perpetua.ltd)
- Email: info@Perpetua.ltd
- Twitter: [@PerpetuaLtd](https://x.com/PerpetuaLtd/)

## Acknowledgments

- Solana Ecosystem
- Open Source Community 