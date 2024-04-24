import { useAccountBalances } from "api/accountBalances"
import { useTokenLocks } from "api/balances"
import { useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0, BN_1 } from "utils/constants"
import { arraySearch } from "utils/helpers"
import { useDisplayPrice, useDisplayPrices } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAcceptedCurrencies, useAccountCurrency } from "api/payments"

export const useAssetsData = ({
  isAllAssets,
  search,
  address: givenAddress,
}: {
  isAllAssets?: boolean
  search?: string
  address?: string
} = {}) => {
  const { assets } = useRpcProvider()
  const { account } = useAccount()
  const address = givenAddress ?? account?.address

  const balances = useAccountBalances(address)
  const nativeTokenWithBalance = balances.data?.native
  const tokensWithBalance = useMemo(() => {
    if (nativeTokenWithBalance && balances.data) {
      const filteredTokens = balances.data.balances.filter((balance) => {
        const meta = assets.getAsset(balance.id)

        return (
          (meta.isToken || meta.isStableSwap || meta.isExternal) &&
          !meta.isNative
        )
      })

      return nativeTokenWithBalance.total.gt(0)
        ? [...filteredTokens, nativeTokenWithBalance]
        : filteredTokens
    }

    return []
  }, [assets, balances.data, nativeTokenWithBalance])

  const tokensWithBalanceIds = tokensWithBalance.map(
    (tokenWithBalance) => tokenWithBalance.id,
  )

  const currencyId = useAccountCurrency(address).data
  const acceptedCurrencies = useAcceptedCurrencies(tokensWithBalanceIds)

  const spotPrices = useDisplayPrices(tokensWithBalanceIds)

  const allAssets = useMemo(
    () => [...assets.tokens, ...assets.stableswap, ...assets.external],
    [assets.external, assets.stableswap, assets.tokens],
  )

  const data = useMemo(() => {
    const rowsWithBalance = tokensWithBalance.map((balance) => {
      let { decimals, id, name, symbol, isExternal } = assets.getAsset(
        balance.id,
      )

      const inTradeRouter = assets.tradeAssets.some(
        (tradeAsset) => tradeAsset.id === id,
      )
      const spotPrice =
        spotPrices.data?.find((spotPrice) => spotPrice?.tokenIn === id)
          ?.spotPrice ?? BN_1

      const reserved = balance.reservedBalance.shiftedBy(-decimals)
      const reservedDisplay = reserved.times(spotPrice)

      const total = balance.total.shiftedBy(-decimals)
      const totalDisplay = total.times(spotPrice)

      const transferable = balance.balance.shiftedBy(-decimals)
      const transferableDisplay = transferable.times(spotPrice)

      const isAcceptedCurrency = !!acceptedCurrencies.data?.find(
        (acceptedCurrencie) => acceptedCurrencie.id === id,
      )?.accepted

      const isPaymentFee = currencyId === id
      const couldBeSetAsPaymentFee = isAcceptedCurrency && !isPaymentFee

      const tradability = {
        canBuy: inTradeRouter,
        canSell: inTradeRouter,
        inTradeRouter,
      }

      return {
        id,
        symbol,
        name,
        decimals,
        isPaymentFee,
        couldBeSetAsPaymentFee,
        reserved,
        reservedDisplay,
        total,
        totalDisplay,
        transferable,
        transferableDisplay,
        tradability,
        isExternal,
      }
    })

    const result = isAllAssets
      ? allAssets.reduce<typeof rowsWithBalance>(
          (acc, { id, symbol, name, decimals, isExternal }) => {
            const tokenWithBalance = rowsWithBalance.find(
              (row) => row.id === id,
            )

            if (tokenWithBalance) {
              acc.push(tokenWithBalance)
            } else {
              const inTradeRouter = assets.tradeAssets.some(
                (tradeAsset) => tradeAsset.id === id,
              )

              const tradability = {
                canBuy: inTradeRouter,
                canSell: inTradeRouter,
                inTradeRouter,
              }

              if (symbol) {
                acc.push({
                  id,
                  symbol,
                  name,
                  decimals,
                  isPaymentFee: false,
                  couldBeSetAsPaymentFee: false,
                  reserved: BN_0,
                  reservedDisplay: BN_0,
                  total: BN_0,
                  totalDisplay: BN_0,
                  transferable: BN_0,
                  transferableDisplay: BN_0,
                  tradability,
                  isExternal,
                })
              }
            }
            return acc
          },
          [],
        )
      : rowsWithBalance

    result.sort((a, b) => {
      // native asset first
      if (a.id === NATIVE_ASSET_ID) return -1
      if (b.id === NATIVE_ASSET_ID) return 1

      if (a.transferableDisplay.isNaN()) return 1
      if (b.transferableDisplay.isNaN()) return -1

      if (a.isExternal && !a.name) return 1
      if (b.isExternal && !b.name) return -1

      if (!b.transferableDisplay.eq(a.transferableDisplay))
        return b.transferableDisplay.minus(a.transferableDisplay).toNumber()

      return a.symbol.localeCompare(b.symbol)
    })

    return search ? arraySearch(result, search, ["symbol", "name"]) : result
  }, [
    acceptedCurrencies.data,
    assets,
    currencyId,
    spotPrices.data,
    tokensWithBalance,
    search,
    isAllAssets,
    allAssets,
  ])

  return { data, isLoading: balances.isLoading }
}

export type AssetsTableData = ReturnType<typeof useAssetsData>["data"][number]

export const useLockedValues = (id: string) => {
  const { assets } = useRpcProvider()
  const isNativeToken = id === assets.native.id

  const locks = useTokenLocks(isNativeToken ? assets.native.id : undefined)
  const spotPrice = useDisplayPrice(
    isNativeToken ? assets.native.id : undefined,
  )

  const data = useMemo(() => {
    if (locks.data && spotPrice.data) {
      const { decimals } = assets.native
      const spotPriceData = spotPrice.data.spotPrice

      const lockVesting = locks.data.find(
        (lock) => lock.id === id.toString() && lock.type === "ormlvest",
      )
      const lockedVesting = lockVesting?.amount.shiftedBy(-decimals) ?? BN_0
      const lockedVestingDisplay = lockedVesting.times(spotPriceData)

      const lockDemocracy = locks.data.find(
        (lock) => lock.id === id.toString() && lock.type === "democrac",
      )
      const lockedDemocracy = lockDemocracy?.amount.shiftedBy(-decimals) ?? BN_0
      const lockedDemocracyDisplay = lockedDemocracy.times(spotPriceData)

      const lockStaking = locks.data.find(
        (lock) => lock.id === id.toString() && lock.type === "stk_stks",
      )
      const lockedStaking = lockStaking?.amount.shiftedBy(-decimals) ?? BN_0
      const lockedStakingDisplay = lockedStaking.times(spotPriceData)

      return {
        lockedVesting,
        lockedVestingDisplay,
        lockedDemocracy,
        lockedDemocracyDisplay,
        lockedStaking,
        lockedStakingDisplay,
      }
    }
  }, [assets.native, id, locks.data, spotPrice.data])

  return {
    data,
    isLoading: locks.isInitialLoading || spotPrice.isInitialLoading,
  }
}
