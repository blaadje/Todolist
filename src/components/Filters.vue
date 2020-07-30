<template>
  <Paper
    v-click-outside="hideFilters"
    :class="[$style.wrapper, { [$style.isVisible]: isVisible }]"
  >
    <div
      :class="[$style.toggleVisibilityPanel, { [$style.isVisible]: isVisible }]"
      @click="toggleVisibility"
    >
      <LeftArrowIcon :class="$style.leftArrowIcon" />
    </div>
    <div :class="$style.content">
      <span :class="$style.remainingTasks">
        {{ remaining }} remaining tasks
      </span>
      <div :class="$style.filtersWrapper">
        <div :class="$style.filters">
          <TagList
            :class="$style.tagsWrapper"
            :tags="tags"
            :selected-tags="selectedTags"
            @selectedTag="(tagId) => $emit('filterByTag', tagId)"
          />
          <div :class="$style.filterWrapper">
            <label :class="[$style.dateLabel, $style.statusTitle]">Date:</label>
            <button
              :class="$style.filterButton"
              :style="buttonsFilter('all')"
              @click.prevent="$emit('filterByAll')"
            >
              All
            </button>
            <button
              :class="$style.filterButton"
              :style="buttonsFilter('date')"
              @click.prevent="$emit('filterByDate')"
            >
              Selected Date
            </button>
          </div>
          <div :class="$style.statusWrapper">
            <label :class="$style.statusTitle">Status:</label>
            <button
              :class="$style.filterButton"
              :style="buttonsStatus('all')"
              @click.prevent="$emit('statusByAll')"
            >
              All
            </button>
            <button
              :class="$style.filterButton"
              :style="buttonsStatus('todo')"
              @click.prevent="$emit('statusByTodo')"
            >
              Todo
            </button>
            <button
              :class="$style.filterButton"
              :style="buttonsStatus('completed')"
              @click.prevent="$emit('statusByCompleted')"
            >
              Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  </Paper>
</template>

<script>
import LeftArrowIcon from '../assets/leftArrow.svg'

import Paper from './Paper'
import TagList from './TagList'

export default {
  components: {
    LeftArrowIcon,
    TagList,
    Paper,
  },
  props: {
    tags: {
      type: Array,
      required: true,
    },
    selectedTags: {
      type: Array,
      default: null,
    },
    colors: {
      type: Object,
      required: true,
    },
    remaining: {
      type: Number,
      required: true,
    },
    filter: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isVisible: false,
    }
  },
  methods: {
    hideFilters() {
      this.isVisible = false
    },
    toggleVisibility() {
      this.isVisible = !this.isVisible
    },
    buttonsStatus(element) {
      if (this.status === element) {
        return {
          border: `1px solid${this.colors.hex}`,
          color: this.colors.hex,
        }
      }
      return 'border: 1px solid #c2c2c2'
    },
    buttonsFilter(element) {
      if (this.filter === element) {
        return {
          border: `1px solid${this.colors.hex}`,
          color: this.colors.hex,
        }
      }
      return 'border: 1px solid #c2c2c2'
    },
  },
}
</script>

<style lang="scss" module>
$visibilityIcon: 20px;

.wrapper {
  display: flex;
  z-index: 1;
  width: auto;
  position: fixed;
  bottom: 5%;
  right: 0;
  padding-left: 0;
  transition: transform 0.3s ease-in-out;
  border-radius: 0.4rem 0 0 0.4rem;
  transform: translateX(calc(100% - #{$visibilityIcon} + 2px));
  &.isVisible {
    transform: translateX(0);
  }
}

.content {
  padding: 1rem 1.1rem;
}

.filtersWrapper {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.hasNoTag {
  border: 1px solid #ededed;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    height: 180%;
    width: 1px;
    background: red;
    transform: rotate(45deg) translate(-50%, -50%);
    transform-origin: 0% 0%;
  }
}

.statusTitle {
  font-size: 0.9rem;
  font-weight: 100;
  color: #757575;
}

.toggleVisibilityPanel {
  cursor: pointer;
  width: $visibilityIcon;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #f4f4f4;

  &.isVisible {
    .leftArrowIcon {
      transform: rotate(180deg);
    }
  }
}

.filters {
  display: inline-flex;
  margin: 0 auto;
  width: auto;
  flex-direction: column;
}

.remainingTasks {
  margin-right: 1em;
  color: #c2c2c2;
  font-size: 0.8em;
  display: block;
  text-align: center;
}

.tagsWrapper {
  display: flex;
  margin-bottom: 1rem;
}

.tag {
  cursor: pointer;
  height: 20px;
  width: 20px;
  margin: 0.3rem;
  border-radius: 0.2rem;
  display: block;
}

.filterWrapper,
.statusWrapper {
  display: flex;
  align-items: center;
}

.filterWrapper {
  margin-bottom: 1rem;
}

.dateLabel {
  margin-right: 0.6rem;
}

.filterButton {
  background: transparent;
  outline: none;
  border: 1px solid #c2c2c2;
  white-space: nowrap;
  padding: 0.5em 1em;
  margin-left: 1rem;
  border-radius: 0;
  font-size: 0.8em;
  color: #c2c2c2;
  text-decoration: none;
}

.footer label[for='toggle-all'] {
  display: none;
}

.leftArrowIcon {
  transition: transform 0.3s ease-in-out;
  width: 14px;
  height: 14px;
}

.toggleAll {
  width: 30px;
  height: 30px;
  position: absolute;
  top: 20px;
  left: 25px;
  text-align: center;
  border: none;
  transform: rotate(90deg);
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.toggleAll:before {
  position: absolute;
  top: 0;
  left: 0;
  content: '❯';
  font-size: 30px;
  color: #e6e6e6;
}

.toggleAll:checked:before {
  color: #737373;
}

.toggleAll:checked:before span {
  margin-right: 1em;
  color: #c2c2c2;
  font-size: 0.8em;
  display: block;
  text-align: center;
}
</style>
