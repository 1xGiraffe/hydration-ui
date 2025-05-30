import {
  BigNumberValue,
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  UserReserveData,
  valueToBigNumber,
} from "@aave/math-utils"
import BigNumber from "bignumber.js"
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"

interface CalculateHFAfterSwapProps {
  fromAmount: BigNumberValue
  fromAssetData: ComputedReserveData
  fromAssetUserData: ComputedUserReserve
  toAmountAfterSlippage: BigNumberValue
  toAssetData: ComputedReserveData
  user: ExtendedFormattedUser
}

interface CalculateHFAfterSwapRepayProps {
  amountToReceiveAfterSwap: BigNumberValue
  amountToSwap: BigNumberValue
  fromAssetData: ComputedReserveData
  toAssetData: ComputedReserveData
  user: ExtendedFormattedUser
  repayWithUserReserve?: UserReserveData
  debt: string
}

interface CalculateHFAfterWithdrawProps {
  user: ExtendedFormattedUser
  userReserve: ComputedUserReserveData
  poolReserve: ComputedReserveData
  withdrawAmount: string
}

export function calculateHFAfterSwap({
  fromAmount,
  fromAssetData,
  fromAssetUserData,
  toAmountAfterSlippage,
  toAssetData,
  user,
}: CalculateHFAfterSwapProps) {
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === fromAssetData.eModeCategoryId
      ? fromAssetData.formattedEModeLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  // it takes into account if in emode as threshold is different
  let hfEffectOfFromAmount = "0"

  if (
    fromAssetUserData.usageAsCollateralEnabledOnUser &&
    fromAssetData.reserveLiquidationThreshold !== "0"
  ) {
    hfEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(
        fromAmount,
      ).multipliedBy(fromAssetData.formattedPriceInMarketReferenceCurrency),
      borrowBalanceMarketReferenceCurrency:
        user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: reserveLiquidationThreshold,
    }).toString()
  }

  // HF after swap (same as supply calcs as it needs to calculate as if we where supplying new reserve)
  let hfEffectOfToAmount = "0"
  if (
    (!user.isInIsolationMode && !toAssetData.isIsolated) ||
    (user.isInIsolationMode &&
      user.isolatedReserve?.underlyingAsset === toAssetData.underlyingAsset)
  ) {
    hfEffectOfToAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(
        toAmountAfterSlippage,
      ).multipliedBy(toAssetData.formattedPriceInMarketReferenceCurrency),
      borrowBalanceMarketReferenceCurrency:
        user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold:
        user.isInEmode &&
        user.userEmodeCategoryId === toAssetData.eModeCategoryId
          ? toAssetData.formattedEModeLiquidationThreshold
          : toAssetData.formattedReserveLiquidationThreshold,
    }).toString()
  }

  return {
    hfEffectOfFromAmount,
    hfAfterSwap:
      user.healthFactor === "-1"
        ? valueToBigNumber("-1")
        : valueToBigNumber(user.healthFactor)
            .plus(hfEffectOfToAmount)
            .minus(hfEffectOfFromAmount),
  }
}

export const calculateHFAfterRepay = ({
  user,
  amountToReceiveAfterSwap,
  amountToSwap,
  fromAssetData,
  toAssetData,
  repayWithUserReserve,
  debt,
}: CalculateHFAfterSwapRepayProps) => {
  // it takes into account if in emode as threshold is different
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === fromAssetData.eModeCategoryId
      ? fromAssetData.formattedEModeLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  let hfInitialEffectOfFromAmount = "0"

  if (
    repayWithUserReserve?.usageAsCollateralEnabledOnUser &&
    fromAssetData.usageAsCollateralEnabled
  ) {
    hfInitialEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(
        amountToSwap,
      ).multipliedBy(fromAssetData.formattedPriceInMarketReferenceCurrency),
      borrowBalanceMarketReferenceCurrency:
        user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: reserveLiquidationThreshold,
    }).toString()
  }

  const fromAmountInMarketReferenceCurrency = valueToBigNumber(
    BigNumber.min(amountToReceiveAfterSwap, debt),
  )
    .multipliedBy(toAssetData.priceInUSD)
    .toString(10)
  let debtLeftInMarketReference = valueToBigNumber(user.totalBorrowsUSD).minus(
    fromAmountInMarketReferenceCurrency,
  )

  debtLeftInMarketReference = BigNumber.max(
    debtLeftInMarketReference,
    valueToBigNumber("0"),
  )

  const hfAfterRepayBeforeWithdraw = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency:
      debtLeftInMarketReference.toString(10),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  })

  const hfRealEffectOfFromAmount =
    fromAssetData.reserveLiquidationThreshold !== "0" &&
    repayWithUserReserve?.usageAsCollateralEnabledOnUser
      ? calculateHealthFactorFromBalancesBigUnits({
          collateralBalanceMarketReferenceCurrency: valueToBigNumber(
            amountToSwap,
          ).multipliedBy(fromAssetData.priceInUSD),
          borrowBalanceMarketReferenceCurrency:
            debtLeftInMarketReference.toString(10),
          currentLiquidationThreshold:
            fromAssetData.formattedReserveLiquidationThreshold,
        }).toString()
      : "0"

  const hfAfterSwap = hfAfterRepayBeforeWithdraw.eq(-1)
    ? hfAfterRepayBeforeWithdraw
    : hfAfterRepayBeforeWithdraw.minus(hfRealEffectOfFromAmount)

  return {
    hfEffectOfFromAmount: valueToBigNumber(hfInitialEffectOfFromAmount),
    hfAfterSwap:
      hfAfterSwap.isLessThan(0) && !hfAfterSwap.eq(-1) ? 0 : hfAfterSwap,
  }
}

export const calculateHFAfterWithdraw = ({
  user,
  userReserve,
  poolReserve,
  withdrawAmount,
}: CalculateHFAfterWithdrawProps) => {
  let totalCollateralInETHAfterWithdraw = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency,
  )
  let liquidationThresholdAfterWithdraw = user.currentLiquidationThreshold
  let healthFactorAfterWithdraw = valueToBigNumber(user.healthFactor)

  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === poolReserve.eModeCategoryId
      ? poolReserve.formattedEModeLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold

  if (
    userReserve?.usageAsCollateralEnabledOnUser &&
    poolReserve.reserveLiquidationThreshold !== "0"
  ) {
    const amountToWithdrawInEth = valueToBigNumber(withdrawAmount).multipliedBy(
      poolReserve.formattedPriceInMarketReferenceCurrency,
    )
    totalCollateralInETHAfterWithdraw = totalCollateralInETHAfterWithdraw.minus(
      amountToWithdrawInEth,
    )

    liquidationThresholdAfterWithdraw = valueToBigNumber(
      user.totalCollateralMarketReferenceCurrency,
    )
      .multipliedBy(valueToBigNumber(user.currentLiquidationThreshold))
      .minus(
        valueToBigNumber(amountToWithdrawInEth).multipliedBy(
          reserveLiquidationThreshold,
        ),
      )
      .div(totalCollateralInETHAfterWithdraw)
      .toFixed(4, BigNumber.ROUND_DOWN)

    healthFactorAfterWithdraw = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency:
        totalCollateralInETHAfterWithdraw,
      borrowBalanceMarketReferenceCurrency:
        user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
    })
  }

  return healthFactorAfterWithdraw
}

interface CalculateHFAfterSupplyProps {
  user: ExtendedFormattedUser
  poolReserve: ComputedReserveData
  supplyAmount: string
}

export const calculateHFAfterSupply = ({
  user,
  poolReserve,
  supplyAmount,
}: CalculateHFAfterSupplyProps) => {
  const supplyAmountInEth = valueToBigNumber(supplyAmount).multipliedBy(
    poolReserve.formattedPriceInMarketReferenceCurrency,
  )

  let healthFactorAfterDeposit = user
    ? valueToBigNumber(user.healthFactor)
    : valueToBigNumber("-1")

  const totalCollateralMarketReferenceCurrencyAfter = user
    ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency).plus(
        supplyAmountInEth,
      )
    : valueToBigNumber("-1")

  const liquidationThresholdAfter = user
    ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
        .multipliedBy(user.currentLiquidationThreshold)
        .plus(
          supplyAmountInEth.multipliedBy(
            poolReserve.formattedReserveLiquidationThreshold,
          ),
        )
        .dividedBy(totalCollateralMarketReferenceCurrencyAfter)
    : valueToBigNumber("-1")

  if (
    user &&
    ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
      (user.isInIsolationMode &&
        user.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset))
  ) {
    healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency:
        totalCollateralMarketReferenceCurrencyAfter,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(
        user.totalBorrowsMarketReferenceCurrency,
      ),
      currentLiquidationThreshold: liquidationThresholdAfter,
    })
  }

  return healthFactorAfterDeposit
}
