import { UseHealthFactorChangeResult } from "api/borrow"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { TAsset } from "providers/assets"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"

type Props = {
  readonly hfChange: UseHealthFactorChangeResult
  readonly minReceived: string
  readonly assetReceived: TAsset | null
}

export const RemoveDepositSummary: FC<Props> = ({
  hfChange,
  minReceived,
  assetReceived,
}) => {
  const { t } = useTranslation()

  return (
    <div>
      <SummaryRow
        label={t("wallet.strategy.deposit.minReceived")}
        withSeparator={!!hfChange}
        content={
          <Text fw={500} fs={14} lh="1" color="white">
            {t("value.tokenApproxWithSymbol", {
              value: minReceived,
              symbol: assetReceived?.symbol,
            })}
          </Text>
        }
      />
      {hfChange && (
        <SummaryRow
          label={t("healthFactor")}
          content={
            <HealthFactorChange
              healthFactor={hfChange.currentHealthFactor}
              futureHealthFactor={hfChange.futureHealthFactor}
            />
          }
        />
      )}
    </div>
  )
}
