<script setup lang="ts">
import { useCalculateMaxProxies } from '@/composables/calculateMaxProxies'
import { handlerProxySelect, proxyProviederList } from '@/store/proxies'
import { computed } from 'vue'
import ProxyNodeCard from './ProxyNodeCard.vue'
import ProxyNodeGrid from './ProxyNodeGrid.vue'

const props = defineProps<{
  name: string
  now: string
  renderProxies: string[]
  showFullContent: boolean
}>()

const groupedProxies = computed(() => {
  const groupdProixes: Record<string, string[]> = {}
  const providerKeys: string[] = []

  for (const proxy of props.renderProxies) {
    const providerName =
      proxyProviederList.value.find((group) => group.proxies.find((node) => node.name === proxy))
        ?.name ?? ''

    if (groupdProixes[providerName]) {
      groupdProixes[providerName].push(proxy)
    } else {
      if (providerName === '') {
        providerKeys.unshift('')
      } else {
        providerKeys.push(providerName)
      }

      groupdProixes[providerName] = [proxy]
    }
  }

  return providerKeys.map((providerName) => [providerName, groupdProixes[providerName]])
})

const { maxProxies } = useCalculateMaxProxies()
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="([providerName, proxies], index) in groupedProxies"
      :key="index"
    >
      <p
        class="my-2 text-sm font-semibold"
        v-if="providerName !== ''"
      >
        {{ providerName }}
      </p>
      <ProxyNodeGrid>
        <ProxyNodeCard
          v-for="node in showFullContent ? proxies : proxies.slice(0, maxProxies)"
          :key="node"
          :name="node"
          :group-name="name"
          :active="node === now"
          @click.stop="handlerProxySelect(name, node)"
        />
      </ProxyNodeGrid>
    </div>
  </div>
</template>
