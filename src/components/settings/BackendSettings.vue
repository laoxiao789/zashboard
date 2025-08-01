<template>
  <!-- backend -->
  <div class="card">
    <div class="card-title px-4 pt-4">
      <div class="indicator">
        <span
          v-if="isCoreUpdateAvailable"
          class="indicator-item top-1 -right-1 flex"
        >
          <span class="bg-secondary absolute h-2 w-2 animate-ping rounded-full"></span>
          <span class="bg-secondary h-2 w-2 rounded-full"></span>
        </span>
        <a
          class="flex cursor-pointer items-center gap-2"
          :href="
            isSingBox
              ? 'https://github.com/sagernet/sing-box'
              : 'https://github.com/metacubex/mihomo'
          "
          target="_blank"
        >
          {{ $t('backend') }}
          <BackendVersion class="text-sm font-normal" />
        </a>
      </div>
    </div>
    <div class="card-body gap-4">
      <BackendSwitch />

      <template v-if="(!isSingBox || displayAllFeatures) && configs">
        <div class="divider"></div>
        <div class="grid max-w-3xl grid-cols-2 gap-2 lg:grid-cols-3">
          <div
            class="flex items-center gap-2"
            v-for="portConfig in portList"
            :key="portConfig.key"
          >
            <span class="shrink-0"> {{ $t(portConfig.label) }} </span>
            <input
              class="input input-sm w-20 sm:w-24"
              type="number"
              v-model="configs[portConfig.key as keyof Config]"
              @change="
                updateConfigs({ [portConfig.key]: Number(configs[portConfig.key as keyof Config]) })
              "
            />
          </div>
        </div>
        <div class="grid max-w-3xl grid-cols-2 gap-2 lg:grid-cols-4">
          <div
            class="flex items-center gap-2"
            v-if="configs?.tun"
          >
            {{ $t('tunMode') }}
            <input
              class="toggle"
              type="checkbox"
              v-model="configs.tun.enable"
              @change="hanlderTunModeChange"
            />
          </div>
          <div class="flex items-center gap-2">
            {{ $t('allowLan') }}
            <input
              class="toggle"
              type="checkbox"
              v-model="configs['allow-lan']"
              @change="handlerAllowLanChange"
            />
          </div>
          <template v-if="!activeBackend?.disableUpgradeCore">
            <div class="flex items-center gap-2">
              {{ $t('checkUpgrade') }}
              <input
                class="toggle"
                type="checkbox"
                v-model="checkUpgradeCore"
                @change="handlerCheckUpgradeCoreChange"
              />
            </div>
            <div
              class="flex items-center gap-2"
              v-if="checkUpgradeCore"
            >
              {{ $t('autoUpgrade') }}
              <input
                class="toggle"
                type="checkbox"
                v-model="autoUpgradeCore"
              />
            </div>
          </template>
        </div>
      </template>

      <div
        v-if="!isSingBox || displayAllFeatures"
        class="grid max-w-6xl grid-cols-2 gap-2"
        :class="hasSmartGroup ? 'md:grid-cols-4 xl:grid-cols-7' : 'md:grid-cols-3 xl:grid-cols-6'"
      >
        <template v-if="!isSingBox || displayAllFeatures">
          <button
            v-if="!activeBackend?.disableUpgradeCore"
            class="btn btn-primary btn-sm"
            @click="showUpgradeCoreModal = true"
          >
            {{ $t('upgradeCore') }}
          </button>
          <button
            class="btn btn-sm"
            @click="handlerClickRestartCore"
          >
            <span
              v-if="isCoreRestarting"
              class="loading loading-spinner loading-md"
            ></span>
            {{ $t('restartCore') }}
          </button>
          <button
            class="btn btn-sm"
            @click="handlerClickReloadConfigs"
          >
            <span
              v-if="isConfigReloading"
              class="loading loading-spinner loading-md"
            ></span>
            {{ $t('reloadConfigs') }}
          </button>
          <button
            class="btn btn-sm"
            @click="handlerClickUpdateGeo"
          >
            <span
              v-if="isGeoUpdating"
              class="loading loading-spinner loading-md"
            ></span>
            {{ $t('updateGeoDatabase') }}
          </button>
          <button
            class="btn btn-sm"
            @click="flushDNSCacheAPI"
          >
            {{ $t('flushDNSCache') }}
          </button>
        </template>
        <button
          class="btn btn-sm"
          @click="flushFakeIPAPI"
        >
          {{ $t('flushFakeIP') }}
        </button>
        <button
          v-if="hasSmartGroup"
          class="btn btn-sm"
          @click="flushSmartGroupWeightsAPI"
        >
          {{ $t('flushSmartWeights') }}
        </button>
      </div>
      <div class="divider"></div>
      <DnsQuery />
    </div>
    <UpgradeCoreModal v-model="showUpgradeCoreModal" />
  </div>
</template>

<script setup lang="ts">
import {
  flushDNSCacheAPI,
  flushFakeIPAPI,
  flushSmartGroupWeightsAPI,
  isCoreUpdateAvailable,
  isSingBox,
  reloadConfigsAPI,
  restartCoreAPI,
  updateGeoDataAPI,
} from '@/api'
import BackendVersion from '@/components/common/BackendVersion.vue'
import BackendSwitch from '@/components/settings/BackendSwitch.vue'
import DnsQuery from '@/components/settings/DnsQuery.vue'
import { configs, fetchConfigs, updateConfigs } from '@/store/config'
import { fetchProxies, hasSmartGroup } from '@/store/proxies'
import { fetchRules } from '@/store/rules'
import { autoUpgradeCore, checkUpgradeCore, displayAllFeatures } from '@/store/settings'
import { activeBackend } from '@/store/setup'
import type { Config } from '@/types'
import { ref } from 'vue'
import UpgradeCoreModal from './UpgradeCoreModal.vue'

const portList = [
  {
    label: 'mixedPort',
    key: 'mixed-port',
  },
  {
    label: 'httpPort',
    key: 'port',
  },
  {
    label: 'socksPort',
    key: 'socks-port',
  },
  {
    label: 'redirPort',
    key: 'redir-port',
  },
  {
    label: 'tproxyPort',
    key: 'tproxy-port',
  },
]

const reloadAll = () => {
  fetchConfigs()
  fetchRules()
  fetchProxies()
}

const showUpgradeCoreModal = ref(false)

const isCoreRestarting = ref(false)
const handlerClickRestartCore = async () => {
  if (isCoreRestarting.value) return
  isCoreRestarting.value = true
  try {
    await restartCoreAPI()
    setTimeout(() => {
      reloadAll()
    }, 500)
    isCoreRestarting.value = false
  } catch {
    isCoreRestarting.value = false
  }
}

const isConfigReloading = ref(false)
const handlerClickReloadConfigs = async () => {
  if (isConfigReloading.value) return
  isConfigReloading.value = true
  try {
    await reloadConfigsAPI()
    reloadAll()
    isConfigReloading.value = false
  } catch {
    isConfigReloading.value = false
  }
}

const isGeoUpdating = ref(false)
const handlerClickUpdateGeo = async () => {
  if (isGeoUpdating.value) return
  isGeoUpdating.value = true
  try {
    await updateGeoDataAPI()
    reloadAll()
    isGeoUpdating.value = false
  } catch {
    isGeoUpdating.value = false
  }
}

const handlerCheckUpgradeCoreChange = () => {
  if (!checkUpgradeCore.value) {
    autoUpgradeCore.value = false
    isCoreUpdateAvailable.value = false
  }
}

const hanlderTunModeChange = async () => {
  await updateConfigs({ tun: { enable: configs.value?.tun.enable } })
}
const handlerAllowLanChange = async () => {
  await updateConfigs({ ['allow-lan']: configs.value?.['allow-lan'] })
}
</script>
