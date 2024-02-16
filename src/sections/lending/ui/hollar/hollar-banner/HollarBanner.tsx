import { valueToBigNumber } from "@aave/math-utils"
import { useNavigate } from "@tanstack/react-location"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { DataValue } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { FC, useMemo } from "react"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRootStore } from "sections/lending/store/root"
import { getGhoReserve } from "sections/lending/utils/ghoUtilities"
import {
  SContainer,
  SContent,
  SHollarImage,
  SInnerContainer,
  SValuesContainer,
} from "./HollarBanner.styled"
import { HollarBorrowApyRange } from "./HollarBorrowApyRange"
import hollarRenderImg from "./assets/hollar-render.png"

type HollarBannerProps = {
  className?: string
}

export const HollarBanner: FC<HollarBannerProps> = ({ className }) => {
  const navigate = useNavigate()
  const currentMarket = useRootStore((store) => store.currentMarket)

  const { reserves, ghoReserveData, ghoLoadingData, loading } =
    useAppDataContext()

  const isLoading = loading || ghoLoadingData

  const { reserve, totalBorrowed } = useMemo(() => {
    const reserve = getGhoReserve(reserves)

    let totalBorrowed = Number(reserve?.totalDebt)
    if (Number(reserve?.borrowCap) > 0) {
      totalBorrowed = BigNumber.min(
        valueToBigNumber(reserve?.totalDebt || 0),
        valueToBigNumber(reserve?.borrowCap || 0),
      ).toNumber()
    }

    return {
      reserve,
      totalBorrowed,
    }
  }, [reserves])

  return (
    <SContainer className={className}>
      <SInnerContainer
        to={ROUTES.reserveOverview(
          reserve?.underlyingAsset || "",
          currentMarket,
        )}
      >
        <SContent>
          <div>
            <Text font="ChakraPetchBold" sx={{ mb: 4 }}>
              Meet Hollar
            </Text>
            <Text
              fs={12}
              lh={16}
              sx={{ maxWidth: ["100%", 245], opacity: 0.7 }}
            >
              HOL is a native decentralized, collateral-backed digital asset
            </Text>
          </div>
          <SValuesContainer>
            <DataValue
              size="small"
              label="Total borrowed"
              labelColor="alpha0"
              isLoading={isLoading}
            >
              <DisplayValue isUSD compact value={totalBorrowed} />
            </DataValue>
            <DataValue
              size="small"
              label="Borrow rate APY"
              labelColor="alpha0"
              isLoading={isLoading}
            >
              <HollarBorrowApyRange
                minVal={ghoReserveData.ghoBorrowAPYWithMaxDiscount}
                maxVal={ghoReserveData.ghoVariableBorrowAPY}
              />
            </DataValue>
            <Button
              size="micro"
              sx={{ py: 6 }}
              css={{ zIndex: 1, position: "relative" }}
              onClick={() =>
                navigate({
                  to: ROUTES.reserveOverview(
                    reserve?.underlyingAsset || "",
                    currentMarket,
                  ),
                })
              }
            >
              Details
            </Button>
          </SValuesContainer>
        </SContent>
      </SInnerContainer>
      <SHollarImage src={hollarRenderImg} width={120} height={120} />
    </SContainer>
  )
}