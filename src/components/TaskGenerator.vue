<template>
  <div :class="$style.wrapper">
    <input
      v-model="newTodoName"
      :class="$style.input"
      type="text"
      placeholder="Create a task"
      @keyup.enter="createTask"
    />
    <TagSelector
      :class="$style.tagSelector"
      :tags="tags"
      @selectedTag="handleSelectedTag"
    />
  </div>
</template>

<script>
import TagSelector from './TagSelector'

export default {
  components: {
    TagSelector,
  },
  props: {
    tags: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      newTodoName: '',
      selectedTag: null,
    }
  },
  methods: {
    handleSelectedTag(tagId) {
      this.selectedTag = tagId
    },
    createTask() {
      if (!this.newTodoName) {
        return
      }

      this.$emit('createTask', this.newTodoName, this.selectedTag)
      this.newTodoName = ''
    },
  },
}
</script>

<style lang="scss" module>
.wrapper {
  display: flex;
  position: relative;
  background: white;
  z-index: 2;
}

.input {
  -webkit-app-region: no-drag;
  border: none;
  font-size: 1.5em;
  font-weight: 200;
  padding: 1em;
  width: 100%;
  margin: 0;
  outline: none;
  box-shadow: 0 5px 10px 1px rgba(0, 0, 0, 0.06);
}

.tagSelector {
  position: absolute;
  top: 25px;
  right: 20px;
}
</style>
