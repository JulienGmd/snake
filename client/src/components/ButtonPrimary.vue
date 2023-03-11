<script setup lang="ts">
defineEmits<{ click: (e: MouseEvent) => void }>()
</script>

<template>
  <button @click="$emit('click')" class="button">
    <slot></slot>
  </button>
</template>

<style scoped>
.button {
  @apply rounded-md bg-green py-2 px-4 font-bold text-gray;
  /* Using regular css because shadow transitions are not smooth with tailwind */
  box-shadow: 0 3px theme(colors.green.dark);
  transition: all 0.2s;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px theme(colors.green.dark);
}

.button:active {
  transform: translateY(1px);
  box-shadow: 0 2px theme(colors.green.dark);
}
</style>
