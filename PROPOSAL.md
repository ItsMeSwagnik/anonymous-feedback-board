# Product Proposal

## What is the product, and who uses it?

The Anonymous Feedback Board is a privacy-preserving decentralized feedback system built on the Midnight Network. It allows users to publish a single message to a shared public board without revealing their wallet address or identity.

The product is designed for situations where people need to communicate honestly without fear of retaliation or social pressure. Potential users include employees providing internal feedback, students submitting suggestions or complaints, community members reporting issues, and organizations collecting anonymous feedback.

Each message is associated with an owner commitment derived from a secret key that is generated and kept locally by the user. When posting or removing a message, the user proves knowledge of the corresponding secret through a zero-knowledge proof without revealing the secret itself.

The current implementation provides both a web interface and CLI, supports Lace and 1AM wallet connections, validates the Midnight network, maintains private state locally, and uses RxJS observables for real-time contract state updates.

The design intentionally keeps the board simple: one message can occupy the board at a time, and only the person who possesses the corresponding secret can remove it. This provides a clear demonstration of anonymous authorization using Midnight's privacy-preserving execution model.

## Why Midnight specifically?

Midnight is particularly well suited to this product because anonymity is a core requirement rather than an optional feature.

On a conventional transparent blockchain, transactions are publicly associated with wallet addresses. Even if the application hides a user's identity at the UI level, an observer can potentially connect the transaction, wallet address, and message activity. This makes truly anonymous feedback difficult to achieve using a transparent ledger alone.

The Anonymous Feedback Board instead separates authorization from identity. The contract stores a cryptographic owner hash rather than the user's secret key or wallet identity. A user proves knowledge of the secret key through a zero-knowledge proof when posting or removing a message.

This means the blockchain can verify:

- that a valid owner exists for the message;
- that the user performing the authorized action knows the corresponding secret;
- that the board state transition is valid;

without requiring the secret key or wallet identity to be revealed.

Midnight therefore allows the application to use blockchain-backed integrity and verifiable authorization while minimizing the amount of personally identifying information exposed on-chain.

The privacy model is also straightforward and auditable: the message itself and board state are public, while the secret required to control the message remains private. This is a better fit for anonymous feedback than simply storing encrypted messages on a transparent blockchain, because encryption alone does not solve the problem of publicly visible transaction identities and authorization relationships.

## Data Model

| Data Point       | Type            | Disclosed To |
|------------------|-----------------|--------------|
| Board state      | Public ledger   | Everyone     |
| Message content  | Public ledger   | Everyone     |
| Sequence number  | Public ledger   | Everyone     |
| Owner hash       | Public ledger   | Everyone     |
| Secret key       | Private witness | No one       |
| Wallet address   | Private witness | No one       |
| Poster identity  | Private witness | No one       |

## Mainnet Feasibility

The project is technically structured with Mainnet migration in mind and is realistic to advance toward Mainnet by Level 6, subject to Midnight Mainnet availability, contract review, and final deployment requirements.

The current implementation already demonstrates the major components required for a production-oriented deployment:

- A compiled Compact smart contract with automated tests covering circuit logic, state transitions, ownership enforcement, and privacy-related behavior.
- A deployed contract on the Midnight Preview network, providing an end-to-end demonstration of the application.
- A web application built with React, TypeScript, and Vite.
- A CLI implementation for interacting with the contract independently of the web interface.
- Lace and 1AM wallet integration through the DApp Connector API.
- Network validation to prevent accidental interaction with an unsupported Midnight network.
- Local private-state storage so the secret required for ownership is not published to the blockchain.
- A dedicated proof-server setup for generating zero-knowledge proofs.
- CI automation that compiles the Compact contract, runs the contract test suite, and builds the API, CLI, and UI.
- Environment-based contract and network configuration, allowing the application to target different Midnight networks without changing the core application logic.

The current Preview deployment is therefore not a throwaway prototype. The same contract, API, CLI, and UI architecture can be carried forward to a Mainnet deployment with network-specific configuration and deployment changes.

Before Mainnet release, the following work would be required:

1. Deploy and verify the contract on Midnight Mainnet.
2. Update the application configuration from Preview to Mainnet.
3. Validate compatibility with the Mainnet versions of the Midnight SDK, wallet connector, proof infrastructure, and Compact compiler.
4. Perform additional security and privacy review of the Compact contract and witness implementation.
5. Test key management and recovery behavior, particularly because losing the secret key means losing the ability to remove the associated message.
6. Validate proof-generation performance and infrastructure requirements under realistic usage.
7. Conduct end-to-end testing with Mainnet wallets and transaction flows.
8. Review operational requirements such as monitoring, error handling, rate limiting, abuse prevention, and deployment rollback procedures.

The main product-level consideration is that the current single-message board is intentionally a minimal architecture for demonstrating anonymous ownership. A Mainnet version could expand this model into multiple boards, organization-specific boards, moderation policies, message expiration, or other privacy-preserving authorization mechanisms without fundamentally changing the underlying ownership-proof approach.

Consequently, the project is feasible as a Mainnet-oriented Midnight application because its core privacy model, contract architecture, wallet integration, proof generation, testing, and deployment configuration are already implemented. The remaining work is primarily Mainnet validation, security hardening, operational preparation, and production deployment rather than a redesign of the core concept.
