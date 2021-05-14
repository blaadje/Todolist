<script>
import { defineComponent, toRefs, useCssModule } from 'vue'

export default defineComponent({
  props: {
    width: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const style = useCssModule()
    const { width } = toRefs(props)

    return () => (
      <div
        class={[
          style.progressBar,
          style.stripes,
          style.animated,
          style.reverse,
          style.slower,
        ]}
      >
        <span style={{ width: width.value }} class={style.progressBarInner} />
      </div>
    )
  },
})
</script>

<style lang="scss" module>
@keyframes animate-stripes {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 60px 0;
  }
}

.progressBar {
  display: flex;
  height: 45px;
  background-color: rgba(black, 0.1);
  border-radius: 5px;
}

.stripes {
  background-size: 30px 30px;
  background-image: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
}

.stripes.animated {
  animation: animate-stripes 1.2s linear infinite;
}

.stripes.animated.slower {
  animation-duration: 1.25s;
}

.stripes.reverse {
  animation-direction: reverse;
}

.progressBarInner {
  height: 100%;
  display: block;
  width: 0%;
  background-color: #59c186;
  border-radius: 3px;
  position: relative;
}
</style>
