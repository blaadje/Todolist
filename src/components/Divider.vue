<template>
  <div :class="$style.wrapper">
    <div :class="$style.divider"></div>
    <label v-if="$slots.default" :class="$style.label"><slot /></label>
  </div>
</template>

<style lang="scss" module>
.wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.divider {
  width: 100%;
  height: 1px;
  background: #ededed;
}

.label {
  color: #757575;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  border: 1px solid #ededed;
  background: white;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
</style>
