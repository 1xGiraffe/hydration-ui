import { z } from "zod"
import { maxBalance, required } from "utils/validators"
import { BN_0 } from "utils/constants"
import { Farm, useOraclePrice } from "api/farms"
import { useMemo } from "react"
import { scale, scaleHuman } from "utils/balance"
import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"
import { TLPData, useLiquidityPositionData } from "utils/omnipool"
import { useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"

export const useZodSchema = ({
  id,
  farms,
  position,
  enabled,
}: {
  id: string
  farms: Farm[]
  position?: TLPData
  enabled: boolean
}) => {
  const assetId = enabled ? id : undefined
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const { data: accountAssets } = useAccountAssets()
  const { getData } = useLiquidityPositionData(assetId ? [assetId] : undefined)

  const meta = getAssetWithFallback(id)
  const balance = assetId
    ? accountAssets?.accountAssetsMap.get(assetId)?.balance
    : undefined

  const minDeposit = useMemo(() => {
    return farms.reduce<{ value: BigNumber; assetId?: string }>(
      (acc, farm) => {
        const minDeposit = farm.globalFarm.minDeposit.toBigNumber()

        return minDeposit.gt(acc.value)
          ? {
              value: minDeposit,
              assetId: farm.globalFarm.incentivizedAsset.toString(),
            }
          : acc
      },
      { value: BN_0, assetId: undefined },
    )
  }, [farms])

  const omnipoolMinDepositValue = useMemo(() => {
    if (position) {
      const data = getData(position, {
        sharesValue: minDeposit.value.toString(),
      })
      return data?.value
    }
  }, [getData, minDeposit.value, position])

  const oraclePrice = useOraclePrice(minDeposit.assetId, assetId)

  if (!oraclePrice.data || assetId === undefined) return undefined

  const rule = required
    .refine(
      () => {
        if (position?.amount) {
          const valueInIncentivizedAsset = position.amount
            .times(oraclePrice.data?.price?.n ?? 1)
            .div(oraclePrice.data?.price?.d ?? 1)

          return valueInIncentivizedAsset.gte(minDeposit.value)
        }

        return true
      },
      () => {
        const maxValue = BigNumber.max(
          minDeposit.value
            .times(oraclePrice.data?.price?.d ?? 1)
            .div(oraclePrice.data?.price?.n ?? 1),
          omnipoolMinDepositValue ?? BN_0,
        )

        return {
          message: t("farms.modal.join.minDeposit", {
            value: scaleHuman(maxValue, meta.decimals).times(1.02),
            symbol: meta.symbol,
          }),
        }
      },
    )
    .refine(
      (value) => {
        return scale(value, meta.decimals).gte(minDeposit.value)
      },
      t("farms.modal.join.minDeposit", {
        value: scaleHuman(
          meta.isShareToken ? minDeposit.value : omnipoolMinDepositValue,
          meta.decimals,
        ).times(1.02),
        symbol: meta.symbol,
      }),
    )

  return z.object({
    amount: position
      ? rule
      : rule.pipe(maxBalance(balance?.balance ?? BN_0, meta.decimals)),
  })
}
