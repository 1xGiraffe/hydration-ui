import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  isXYKEnabled,
  useOmnipoolAndStablepool,
  useXYKPools,
} from "sections/pools/PoolsPage.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { Pool } from "sections/pools/pool/Pool"
import { PoolSkeleton } from "sections/pools/skeleton/PoolSkeleton"
import { BN_0 } from "utils/constants"
import { XYKPool } from "sections/pools/pool/xyk/XYKPool"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"

export const AllPools = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()

  if (!isLoaded)
    return (
      <>
        <HeaderValues
          values={[
            {
              label: t("liquidity.header.omnipool"),
              content: <HeaderTotalData isLoading />,
            },
            {
              label: t("liquidity.header.stablepool"),
              content: <HeaderTotalData isLoading />,
            },
            ...(isXYKEnabled
              ? [
                  {
                    label: t("liquidity.header.isolated"),
                    content: <HeaderTotalData isLoading />,
                  },
                ]
              : []),
            {
              withoutSeparator: true,
              label: t("liquidity.header.24hours"),
              content: <HeaderTotalData isLoading />,
            },
          ]}
        />
        <div sx={{ flex: "column", gap: 20 }}>
          {[...Array(3)].map((_, index) => (
            <PoolSkeleton key={index} length={3} index={index} />
          ))}
        </div>
      </>
    )

  return <AllPoolsData />
}

const XYKPoolHeaderValue = () => {
  const xylPools = useXYKPools()

  const totalLocked = useMemo(() => {
    if (xylPools.data) {
      return xylPools.data.reduce((acc, xykPool) => {
        return acc.plus(xykPool.totalDisplay ?? BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xylPools.data])

  return <HeaderTotalData isLoading={xylPools.isLoading} value={totalLocked} />
}

const XYKPoolsSection = () => {
  const { t } = useTranslation()
  const xylPools = useXYKPools()
  const { search } = useSearchFilter()

  if (!xylPools.data) return null

  const filteredPools =
    search && xylPools.data
      ? arraySearch(xylPools.data, search, ["name", "symbol"])
      : xylPools.data

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
        {t("liquidity.section.xyk")}
      </Text>
      {filteredPools.map((pool) => (
        <XYKPool key={pool.id} pool={pool} />
      ))}
    </div>
  )
}

const AllPoolsData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const omnipoolAndStablepool = useOmnipoolAndStablepool()

  const omnipoolTotal = useMemo(() => {
    if (omnipoolAndStablepool.data) {
      return omnipoolAndStablepool.data.reduce(
        (acc, asset) => acc.plus(asset.totalDisplay),
        BN_0,
      )
    }

    return BN_0
  }, [omnipoolAndStablepool.data])

  const stablepoolTotal = useMemo(() => {
    if (omnipoolAndStablepool.data) {
      return omnipoolAndStablepool.data.reduce(
        (acc, asset) => acc.plus(asset.stablepoolTotal.value),
        BN_0,
      )
    }

    return BN_0
  }, [omnipoolAndStablepool.data])

  const omnipoolTradeTotal = useMemo(() => {
    return (
      omnipoolAndStablepool.data?.reduce(
        (acc, item) => acc.plus(item.volumeDisplay ?? 0),
        BN_0,
      ) ?? BN_0
    )
  }, [omnipoolAndStablepool.data])

  const filteredPools =
    search && omnipoolAndStablepool.data
      ? arraySearch(omnipoolAndStablepool.data, search, ["name", "symbol"])
      : omnipoolAndStablepool.data

  return (
    <>
      <HeaderValues
        values={[
          {
            label: t("liquidity.header.omnipool"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={omnipoolTotal}
              />
            ),
          },
          {
            label: t("liquidity.header.stablepool"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={stablepoolTotal}
              />
            ),
          },
          ...(isXYKEnabled
            ? [
                {
                  label: t("liquidity.header.isolated"),
                  content: <XYKPoolHeaderValue />,
                },
              ]
            : []),

          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={omnipoolTradeTotal.div(2)}
              />
            ),
          },
        ]}
      />
      <SearchFilter />
      <div sx={{ flex: "column", gap: 20 }}>
        <div sx={{ flex: "column", gap: 20 }}>
          <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
            {t("liquidity.section.omnipoolAndStablepool")}
          </Text>
          {omnipoolAndStablepool.isLoading
            ? [...Array(3)].map((_, index) => (
                <PoolSkeleton key={index} length={3} index={index} />
              ))
            : filteredPools?.map((pool) => <Pool key={pool.id} pool={pool} />)}
        </div>
        {isXYKEnabled && <XYKPoolsSection />}
      </div>
    </>
  )
}