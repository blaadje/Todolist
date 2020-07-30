<template>
  <div :class="$style.wrapper">
    <div :class="$style.button" @click="toggleVisibility">
      <span :class="$style.label">Sort by</span>
      <span :class="$style.activeLabel">{{ activeSort.label }}</span>
      <SortIcon :class="$style.sortIcon" />
    </div>
    <Paper v-if="isVisible" v-click-outside="hide" :class="$style.content">
      <div
        v-for="{ label, value } in sortBy"
        :key="value"
        :class="[
          $style.contentItem,
          { [$style.isSelected]: isSelected(value) },
        ]"
        @click="handleSort(value)"
      >
        {{ label }}
        <CheckIcon v-if="isSelected(value)" :class="$style.checkIcon" />
      </div>
    </Paper>
  </div>
</template>

<script>
import CheckIcon from '@assets/check.svg'
import SortIcon from '@assets/sort.svg'

import Paper from './Paper'

export default {
  components: {
    CheckIcon,
    SortIcon,
    Paper,
  },
  props: {
    activeSort: {
      type: Object,
      required: true,
    },
    sortBy: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isVisible: false,
    }
  },
  methods: {
    isSelected(sort) {
      return sort === this.activeSort.value
    },
    handleSort(sort) {
      this.$emit('sortBy', sort)
    },
    toggleVisibility() {
      this.isVisible = !this.isVisible
    },
    hide() {
      this.isVisible = false
    },
  },
}
</script>

<style lang="scss" module>
.wrapper {
  position: relative;
}

.content {
  padding: 0;
  position: absolute;
  top: 100%;
  right: 10px;
  white-space: nowrap;
}

.sortIcon {
  cursor: pointer;
  height: 12px;
  width: 12px;
  fill: #757575;
  margin-right: 0.6rem;
}

.activeLabel {
  color: #757575;
  margin-right: 0.6rem;
  white-space: nowrap;
}

.button {
  user-select: none;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

.label {
  color: #c2c2c2;
  margin-right: 0.4rem;
  white-space: nowrap;
}

.arrow {
  border-style: solid;
  border-width: 0 5px 5px 5px;
  transform: rotate(180deg);
  border-color: transparent transparent #757575 transparent;
}

.contentItem {
  display: flex;
  align-items: center;
  color: #757575;
  cursor: pointer;
  padding: 1.2rem;

  &.isSelected {
    background: #f5f7fc;
    color: #b6c1d6;
  }
}

.checkIcon {
  color: #2ec684;
  height: 15px;
  width: 15px;
  margin-left: 0.8rem;
}
</style>