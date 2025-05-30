import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { SSelectAssetButton } from "./AssetSelect.styled"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import { useMedia } from "react-use"
import { useTranslation } from "react-i18next"
import { useAssets } from "providers/assets"

type Props = {
  onClick?: () => void
  assetId: string
  className?: string
  fullWidth?: boolean
  disabled?: boolean
}

export const AssetSelectButton = ({
  onClick,
  assetId,
  className,
  fullWidth,
  disabled,
}: Props) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()
  const asset = getAsset(assetId)
  const isTablet = useMedia(theme.viewport.gte.sm)

  const isAssetFound = !!asset?.id

  const symbol = asset?.symbol
  const name = asset?.name

  const isSelectable = !!onClick

  return (
    <SSelectAssetButton
      fullWidth={fullWidth}
      className={className}
      size="small"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
    >
      <MultipleAssetLogo size={[24, 30]} iconId={asset?.iconId} />

      {isAssetFound && (
        <div sx={{ flex: "column", justify: "space-between", minWidth: 0 }}>
          <Text fw={700} font="GeistSemiBold" lh={16} color="white">
            {symbol}
          </Text>
          <Text
            fs={13}
            lh={13}
            truncate={120}
            css={{
              color: `rgba(${theme.rgbColors.whiteish500}, 0.6)`,
              display: isTablet ? "block" : "none",
            }}
          >
            {name}
          </Text>
        </div>
      )}

      {!isAssetFound && isSelectable && (
        <Text fw={700} font="GeistMedium" lh={16} color="white">
          {t("wallet.assets.transfer.asset.label_mob")}
        </Text>
      )}

      {isSelectable && <Icon sx={{ ml: "auto" }} icon={<ChevronDown />} />}
    </SSelectAssetButton>
  )
}
