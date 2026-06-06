<script setup>
import RegistrationWizard from 'src/components/RegistrationWizard.vue'
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-surface-l0 border-b divider-default" elevated>
      <q-toolbar class="max-w-4xl mx-auto px-4 py-3">
        <div>
          <p class="text-subtitle1 text-neutral leading-none">WebDev Summit 2028</p>
          <p class="text-xs text-neutral-muted leading-none mt-0.5">November 15–16, 2028 · San Francisco</p>
        </div>
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
