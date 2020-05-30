<template>
  <div v-click-outside="hideTagSelector">
    <div :class="$style.topWrapper" @click="toggleTagSelector">
      <Pellet :background="selectedTagColor" />
      <DownArrowIcon :class="$style.downArrowIcon" />
    </div>
    <TagList
      v-if="tagSelectorVisible"
      :class="$style.tagList"
      :horizontal="false"
      :tags="tags"
      @selectedTag="setSelectedTag"
    />
  </div>
</template>

<script>
import Pellet from './Pellet'
import TagList from './TagList'
import DownArrowIcon from '@assets/downArrow.svg'

export default {
  components: {
    DownArrowIcon,
    TagList,
    Pellet,
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
}
</script>

<style lang="scss" module>
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
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
  border-radius: 0.2rem;
  background: white;
  padding: 0.5rem;
}
</style>