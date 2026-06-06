<script setup>
import { useI18n } from 'vue-i18n'
import RegistrationWizard from 'src/components/RegistrationWizard.vue'
import { SUPPORTED_LOCALES } from 'src/i18n/index.js'
import { setLocale } from 'src/boot/i18n.js'

const { t, locale } = useI18n()

function onLocaleChange(value) {
  setLocale(value)
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-surface-l0 border-b divider-default" elevated>
      <q-toolbar class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-subtitle1 text-neutral leading-none truncate">{{ t('app.title') }}</p>
          <p class="text-xs text-neutral-muted leading-none mt-0.5 truncate">{{ t('app.subtitle') }}</p>
        </div>
        <q-select
          :model-value="locale"
          :options="SUPPORTED_LOCALES"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          dense
          outlined
          bg-color="white"
          :aria-label="t('lang.label')"
          class="flex-shrink-0 w-32"
          @update:model-value="onLocaleChange"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="bg-surface-l1">
        <div class="max-w-4xl mx-auto px-4 py-8">
          <RegistrationWizard />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
