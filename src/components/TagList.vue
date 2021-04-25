<template>
  <div :class="[$style.wrapper, { [$style.vertical]: !horizontal }]">
    <Pellet @click.native="$emit('selectedTag')" />
    <Pellet
      v-for="tag in tags"
      :key="tag.id"
      :class="{
        [$style.selected]: selectedTags && selectedTags.includes(tag.id),
      }"
      :background="tag.color"
      @click.native="$emit('selectedTag', tag.id)"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'

import Pellet from './Pellet'

export default defineComponent({
  components: {
    Pellet,
  },
  props: {
    horizontal: {
      type: Boolean,
      default: true,
    },
    selectedTags: {
      type: Array,
      default: () => [],
    },
    tags: {
      type: Array,
      required: true,
    },
  },
})
</script>

<style lang="scss" module>
.wrapper {
  display: flex;
}

.vertical {
  flex-direction: column;
}

.selected {
  transform: scale(1.3);
}
</style>
