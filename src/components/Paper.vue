<template>
  <div :class="$style.wrapper">
    <slot />
  </div>
</template>

<style lang="scss" module>
.wrapper {
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
  background: white;
  padding: 0.5rem;
  border-radius: 0.2rem;
}
</style>