export enum WalletProviderType {
  MetaMask = "metamask",
  Talisman = "talisman",
  TalismanEvm = "talisman-evm",
  SubwalletJS = "subwallet-js",
  SubwalletEvm = "subwallet-evm",
  PolkadotJS = "polkadot-js",
  NovaWallet = "nova-wallet",
  TrustWallet = "trustwallet",
  BraveWallet = "bravewallet",
  BraveWalletSol = "bravewallet-sol",
  CoinbaseWallet = "coinbasewallet",
  RabbyWallet = "rabbywallet",
  Nightly = "nightly",
  NightlyEvm = "nightly-evm",
  Phantom = "phantom",
  Solflare = "solflare",
  Enkrypt = "enkrypt",
  MantaWallet = "manta-wallet-js",
  FearlessWallet = "fearless-wallet",
  Polkagate = "polkagate",
  AlephZero = "aleph-zero",
  WalletConnect = "walletconnect",
  WalletConnectEvm = "walletconnect-evm",
  ExternalWallet = "external",
}

export const MOBILE_ONLY_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.NovaWallet,
]

export const DESKTOP_ONLY_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.PolkadotJS,
]

export const EVM_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.TalismanEvm,
  WalletProviderType.SubwalletEvm,
  // WalletProviderType.NightlyEvm,
  WalletProviderType.RabbyWallet,
  // WalletProviderType.TrustWallet,
  // WalletProviderType.CoinbaseWallet,
  WalletProviderType.BraveWallet,
  WalletProviderType.WalletConnectEvm,
]

export const SUBSTRATE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.PolkadotJS,
  WalletProviderType.Talisman,
  WalletProviderType.SubwalletJS,
  WalletProviderType.Enkrypt,
  WalletProviderType.NovaWallet,
  // WalletProviderType.Nightly,
  WalletProviderType.MantaWallet,
  WalletProviderType.FearlessWallet,
  WalletProviderType.Polkagate,
  WalletProviderType.AlephZero,
  WalletProviderType.WalletConnect,
]

export const SUBSTRATE_H160_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.SubwalletJS,
  WalletProviderType.Talisman,
]

export const SOLANA_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.Phantom,
  WalletProviderType.Solflare,
  WalletProviderType.BraveWalletSol,
]

export const ALTERNATIVE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.ExternalWallet,
]
