<template>
  <div class="card hover:bg-base-200 mb-1 gap-2 p-2 text-sm">
    <div class="flex gap-2">
      <span class="badge badge-sm bg-base-200/50 text-base-content/80">{{ log.seq }}</span>
      <span class="text-main">
        {{ log.time }}
      </span>
      <span :class="textColorMapForType[log.type as keyof typeof textColorMapForType]">
        {{ log.type }}
      </span>
    </div>
    <div class="break-all">{{ log.payload }}</div>
  </div>
</template>

<script setup lang="ts">
import { useBounceOnVisible } from '@/composables/bouncein'
import { LOG_LEVEL } from '@/constant'
import type { LogWithSeq } from '@/types'

defineProps<{
  log: LogWithSeq
}>()

const textColorMapForType = {
  [LOG_LEVEL.Trace]: 'text-success',
  [LOG_LEVEL.Debug]: 'text-accent',
  [LOG_LEVEL.Info]: 'text-info',
  [LOG_LEVEL.Warning]: 'text-warning',
  [LOG_LEVEL.Error]: 'text-error',
  [LOG_LEVEL.Fatal]: 'text-error',
  [LOG_LEVEL.Panic]: 'text-error',
}

useBounceOnVisible()
</script>
