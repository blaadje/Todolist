<template>
  <div :class="$style.wrapper">
    <div
      v-if="hasTask"
      :class="[$style.allCompletedWrapper, { [$style.isSelected]: allDone }]"
      @click="$emit('toggleAllCompleted')"
    >
      <div :class="$style.allCompletedIconWrapper">
        <AllCompletedIcon :class="$style.allCompletedIcon" />
      </div>
      <span :class="$style.allCompletedText">Toggle all completed</span>
    </div>
    <div
      v-if="isToday && hasRemainingTask"
      :class="$style.transferRemainingWrapper"
      @click="$emit('transferRemainingTasks')"
    >
      <div :class="$style.transferTodayIconWrapper">
        <TransferTodayIcon :class="$style.transferTodayIcon" />
      </div>
      <span :class="$style.allCompletedText">
        Transfer remaining tasks
      </span>
    </div>
  </div>
</template>

<script>
import AllCompletedIcon from '@assets/allcompleted.svg'
import TransferTodayIcon from '@assets/transferToday.svg'

export default {
  components: {
    AllCompletedIcon,
    TransferTodayIcon,
  },
  props: {
    isToday: {
      type: Boolean,
      required: true,
    },
    allDone: {
      type: Boolean,
      required: true,
    },
    hasTask: {
      type: Boolean,
      required: true,
    },
    hasRemainingTask: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style lang="scss" module>
.wrapper {
  display: flex;
}

.transferRemainingWrapper {
  display: flex;
  padding: 1.5rem;
  align-items: center;
  cursor: pointer;
}

.transferTodayIconWrapper,
.allCompletedIconWrapper {
  border: 1px solid #efefef;
  border-radius: 50%;
  position: relative;
  height: 40px;
  width: 40px;
}

.transferTodayIcon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 18px;
  width: 18px;
  fill: #5dc2b1;
}

.allCompletedWrapper {
  display: flex;
  cursor: pointer;
  padding: 1.5rem;
  align-items: center;
  position: relative;

  &.isSelected {
    .allCompletedIconWrapper {
      background: #ededed;
    }
  }
}

.allCompletedIcon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 18px;
  width: 18px;
  stroke: #5dc2b1;
}

.allCompletedText {
  user-select: none;
  margin-left: 15px;
  font-weight: 100;
  color: grey;
}
</style>