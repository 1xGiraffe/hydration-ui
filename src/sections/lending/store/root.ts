import { enableMapSet } from "immer"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"
import create from "zustand"
import { devtools, subscribeWithSelector } from "zustand/middleware"

import { createGhoSlice, GhoSlice } from "./ghoSlice"
import { createIncentiveSlice, IncentiveSlice } from "./incentiveSlice"
import { createLayoutSlice, LayoutSlice } from "./layoutSlice"
import { createPoolSlice, PoolSlice } from "./poolSlice"
import { createProtocolDataSlice, ProtocolDataSlice } from "./protocolDataSlice"
import { createTransactionsSlice, TransactionsSlice } from "./transactionsSlice"
import { createSingletonSubscriber } from "./utils/createSingletonSubscriber"
import { getQueryParameter } from "./utils/queryParams"
import { createV3MigrationSlice, V3MigrationSlice } from "./v3MigrationSlice"
import { createWalletSlice, WalletSlice } from "./walletSlice"

enableMapSet()

export type RootStore = ProtocolDataSlice &
  WalletSlice &
  PoolSlice &
  IncentiveSlice &
  V3MigrationSlice &
  GhoSlice &
  TransactionsSlice &
  LayoutSlice

export const useRootStore = create<RootStore>()(
  subscribeWithSelector(
    devtools((...args) => {
      return {
        ...createProtocolDataSlice(...args),
        ...createWalletSlice(...args),
        ...createPoolSlice(...args),
        ...createIncentiveSlice(...args),
        ...createV3MigrationSlice(...args),
        ...createGhoSlice(...args),
        ...createTransactionsSlice(...args),
        ...createLayoutSlice(...args),
      }
    }),
  ),
)

// hydrate state from localeStorage to not break on ssr issues
if (typeof document !== "undefined") {
  document.onreadystatechange = function () {
    if (document.readyState === "complete") {
      const selectedMarket =
        getQueryParameter("marketName") ||
        localStorage.getItem("selectedMarket")

      if (selectedMarket) {
        const currentMarket = useRootStore.getState().currentMarket
        const setCurrentMarket = useRootStore.getState().setCurrentMarket
        if (selectedMarket !== currentMarket) {
          setCurrentMarket(selectedMarket as CustomMarket, true)
        }
      }
    }
  }
}

export const usePoolDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolData()
}, 60_000)

export const usePoolDataV3Subscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolV3Data()
}, 60_000)

export const useIncentiveDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshIncentiveData()
}, 60_000)

export const useGhoDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshGhoData()
}, 60_000)

export const useCurrentMarketData = () => {
  const { currentMarketData, data } = useRootStore.getState()
  return data
    .get(currentMarketData.chainId)
    ?.get(currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER)
}
