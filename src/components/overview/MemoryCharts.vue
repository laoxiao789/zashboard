<template>
  <BasicCharts
    :data="chartsData"
    :label-formatter="labelFormatter"
    :tool-tip-formatter="tooltipFormatter"
    :min="100 * 1024 * 1024"
  />
</template>

<script setup lang="ts">
import { getToolTipForParams } from '@/helper'
import { prettyBytesHelper } from '@/helper/utils'
import { memoryHistory } from '@/store/overview'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BasicCharts from './BasicCharts.vue'

const { t } = useI18n()
const chartsData = computed(() => {
  return [
    {
      name: t('memoryUsage'),
      data: memoryHistory.value,
    },
  ]
})

const labelFormatter = (value: number) => {
  return `${prettyBytesHelper(value, {
    maximumFractionDigits: 0,
    binary: true,
  })}`
}
const tooltipFormatter = (value: ToolTipParams[]) => {
  return getToolTipForParams(value[0], {
    binary: true,
    suffix: '',
  })
}
</script>
