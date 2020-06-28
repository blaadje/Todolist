<template>
  <button
    :class="[$style.wrapper, { [$style.disabled]: disabled }]"
    v-on="$listeners"
    :style="{
      background: filled ? color : 'none',
      color: filled ? 'white' : color,
      border: filled ? '' : `1px solid ${color}`,
    }"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script>
export default {
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
}
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
}

.disabled {
  border: 1px solid #e7ebf3 !important;
  color: #9b9b9b !important;
  cursor: no-drop;
}
</style>
