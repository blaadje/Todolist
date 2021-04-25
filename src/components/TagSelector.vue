<template>
  <div v-click-outside="hideTagSelector">
    <div :class="$style.topWrapper" @click="toggleTagSelector">
      <Pellet :background="selectedTagColor" />
      <DownArrowIcon :class="$style.downArrowIcon" />
    </div>
    <Paper v-if="tagSelectorVisible" :class="$style.content">
      <TagList
        :class="$style.tagList"
        :horizontal="false"
        :tags="tags"
        @selectedTag="setSelectedTag"
      />
    </Paper>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

import DownArrowIcon from '@assets/downArrow.svg'

import Paper from './Paper'
import Pellet from './Pellet'
import TagList from './TagList'

export default defineComponent({
  components: {
    DownArrowIcon,
    TagList,
    Pellet,
    Paper,
  },
  props: {
    tags: {
      type: Array,
      required: true,
    },
  },
  data() {
    return { selectedTag: null, tagSelectorVisible: false }
  },
  computed: {
    selectedTagColor() {
      const tag = this.tags.find(({ id }) => id === this.selectedTag)

      return tag && tag.color
    },
  },
  methods: {
    hideTagSelector() {
      this.tagSelectorVisible = false
    },
    toggleTagSelector() {
      this.tagSelectorVisible = !this.tagSelectorVisible
    },
    setSelectedTag(tagId) {
      this.selectedTag = tagId
      this.$emit('selectedTag', tagId)
    },
  },
})
</script>

<style lang="scss" module>
.content {
  position: absolute;
  top: 100%;
  right: 0;
}

.topWrapper {
  display: flex;
  cursor: pointer;
  align-items: center;
}

.downArrowIcon {
  height: 15px;
  width: 15px;
  margin-left: 5px;
}

.tagList {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}
</style>
