<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hovered = ref(0)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-lg gap-0.5'
    case 'lg': return 'text-3xl gap-1.5'
    default: return 'text-2xl gap-1'
  }
})

function handleClick(star: number) {
  if (!props.readonly) {
    emit('update:modelValue', star)
  }
}
</script>

<template>
  <div
    class="inline-flex items-center"
    :class="[sizeClasses, { 'cursor-pointer': !readonly }]"
    @mouseleave="hovered = 0"
  >
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      :disabled="readonly"
      class="transition-transform duration-150 disabled:cursor-default"
      :class="!readonly ? 'hover:scale-125 active:scale-90' : ''"
      @mouseenter="hovered = star"
      @click="handleClick(star)"
    >
      <span :class="star <= (hovered || modelValue) ? 'grayscale-0' : 'grayscale opacity-30'">
        ⭐
      </span>
    </button>
  </div>
</template>
