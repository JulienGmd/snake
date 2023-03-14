<script setup lang="ts">
defineProps<{ show: boolean }>()
</script>

<template>
  <Transition>
    <div v-show="show" class="absolute inset-0 grid place-items-center bg-gray-dark bg-opacity-50">
      <div class="modal grid justify-items-center rounded-lg bg-gray py-5 px-7 shadow-lg">
        <div class="text-2xl font-medium">
          <slot name="title"></slot>
        </div>
        <div class="mt-4 text-center">
          <slot name="content"></slot>
        </div>
        <div class="mt-6">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s;
}

.v-enter-from .modal,
.v-leave-to .modal {
  transform: translateY(10px);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.v-enter-active .modal,
.v-leave-active .modal {
  transition: transform 0.3s;
}
</style>
