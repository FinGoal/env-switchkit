<template>
  <Nuxt />
</template>

<script>
export default {
  beforeMount() {
    // Manages the state - commit user and Plaid Metadata from session storage, if they exist in the browser's application storage.
    this.$store.commit("setUserFromStorage");
    this.$store.commit("setPlaidMetaFromStorage");
  }
}
</script>

