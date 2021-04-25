<template>
  <button
    :class="[$style.wrapper, { [$style.disabled]: disabled }]"
    :style="{
      background: filled ? color : 'none',
      color: filled ? 'white' : color,
      border: filled ? '' : `1px solid ${color}`,
    }"
    :disabled="disabled"
    v-on="$attrs"
  >
    <slot />
  </button>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    color: {
      type: String,
      default: 'white',
    },
    filled: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<style lang="scss" module>
.wrapper {
  display: inline-block;
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: auto;
  outline: none;
}

.disabled {
  border: 1px solid #e7ebf3 !important;
  color: #9b9b9b !important;
  cursor: no-drop;
}
</style>
