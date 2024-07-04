import { InputBox } from "components/Input/InputBox"
import { FC } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { MemepadStep1Values } from "./MemepadForm.utils"

type MemepadFormStep1Props = {
  form: UseFormReturn<MemepadStep1Values>
}

export const MemepadFormStep1: FC<MemepadFormStep1Props> = ({ form }) => {
  const { t } = useTranslation()

  return (
    <form autoComplete="off">
      <div sx={{ flex: "column", gap: 8 }}>
        <input
          type="hidden"
          {...form.register("origin", { valueAsNumber: true })}
        />
        <input
          type="hidden"
          {...(form.register("decimals"), { valueAsNumber: true })}
        />
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <InputBox
              label={t("wallet.addToken.form.name")}
              withLabel
              error={form.formState.errors.name?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="symbol"
          control={form.control}
          render={({ field }) => (
            <InputBox
              label={t("wallet.addToken.form.symbol")}
              withLabel
              error={form.formState.errors.symbol?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="supply"
          control={form.control}
          render={({ field }) => (
            <InputBox
              label={t("wallet.addToken.form.supply")}
              withLabel
              error={form.formState.errors.supply?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="account"
          control={form.control}
          render={({ field }) => (
            <InputBox
              label={t("wallet.addToken.form.account")}
              withLabel
              error={form.formState.errors.account?.message}
              {...field}
            />
          )}
        />
      </div>
    </form>
  )
}
