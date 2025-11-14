<template>
  <div id="app">
    <Layout>
      <router-view />
    </Layout>
  </div>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue';
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>

