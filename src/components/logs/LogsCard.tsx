import { useBounceOnVisible } from '@/composables/bouncein'
import { LOG_LEVEL } from '@/constant'
import { isMiddleScreen } from '@/helper/utils'
import type { LogWithSeq } from '@/types'
import { defineComponent } from 'vue'

const textColorMapForType: Record<LOG_LEVEL, string> = {
  [LOG_LEVEL.Trace]: 'text-success',
  [LOG_LEVEL.Debug]: 'text-accent',
  [LOG_LEVEL.Info]: 'text-info',
  [LOG_LEVEL.Warning]: 'text-warning',
  [LOG_LEVEL.Error]: 'text-error',
  [LOG_LEVEL.Fatal]: 'text-error',
  [LOG_LEVEL.Panic]: 'text-error',
  [LOG_LEVEL.Silent]: '',
}

export default defineComponent({
  name: 'LogsCard',
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
  setup(props: { log: LogWithSeq }) {
    useBounceOnVisible()

    return () => {
      const time = <span class="text-main mr-2">{props.log.time}</span>
      const type = (
        <span class={['mr-2', textColorMapForType[props.log.type as LOG_LEVEL]]}>
          {props.log.type}
        </span>
      )
      const payload = <span class="mr-2 break-all">{props.log.payload}</span>
      const seq = <span class="badge badge-sm bg-base-200/50">{props.log.seq}</span>

      if (isMiddleScreen.value) {
        return (
          <div class="card hover:bg-base-200 mb-1 gap-2 p-2 text-sm">
            <div class="flex">
              {time}
              {type}
              <div class="flex-1" />
              {seq}
            </div>
            <div>{payload}</div>
          </div>
        )
      }

      return (
        <div class="card hover:bg-base-200 mb-1 flex-row gap-2 p-2 text-sm">
          <div class="flex-1">
            {time}
            {type}
            {payload}
          </div>
          {seq}
        </div>
      )
    }
  },
})
