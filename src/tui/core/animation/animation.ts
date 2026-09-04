/**
 * @brief Animation tweening: easing functions and immutable animation state.
 * @since 0.1.2
 */

/** @brief Easing function: maps normalized progress t ∈ [0,1] to eased progress. @since 0.1.2 */
export type EasingFn = (t: number) => number;

/** @brief Linear easing (passthrough). @param {number} t - progress 0..1. @return {number} same value. @since 0.1.2 */
export const linear: EasingFn = (t) => t;

/** @brief Cubic ease-in (slow start). @param {number} t - progress 0..1. @return {number} eased value. @since 0.1.2 */
export const easeIn: EasingFn = (t) => t * t * t;

/** @brief Cubic ease-out (fast start, slow end). @param {number} t - progress 0..1. @return {number} eased value. @since 0.1.2 */
export const easeOut: EasingFn = (t) => {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
};

/** @brief Cubic ease-in-out (smooth both ends). @param {number} t - progress 0..1. @return {number} eased value. @since 0.1.2 */
export const easeInOut: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** @brief Spring easing (overshoot then settle). @param {number} t - progress 0..1. @return {number} eased value. @since 0.1.2 */
export const spring: EasingFn = (t) => {
  const k = 4;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return (t * Math.exp(k - k * t)) / (Math.exp(k - k) / 1);
};

/** @brief Bundle of built-in easings. @since 0.1.2 */
export const EASING = { linear, easeIn, easeOut, easeInOut, spring } as const;

/** @brief Interpolate between from and to at normalized progress with easing. @param {number} from - start value. @param {number} to - end value. @param {number} duration - total duration in ms. @param {EasingFn} easing - easing function. @param {number} now - current timestamp in ms. @param {number} startTime - animation start in ms. @return {number} interpolated value. @since 0.1.2 */
export function tween(
  from: number,
  to: number,
  duration: number,
  easing: EasingFn,
  now: number,
  startTime: number,
): number {
  if (duration <= 0) return to;
  const raw = (now - startTime) / duration;
  const t = raw < 0 ? 0 : raw > 1 ? 1 : raw;
  return from + (to - from) * easing(t);
}

/** @brief Immutable animation record. @since 0.1.2 */
export interface Animation {
  from: number;
  to: number;
  duration: number;
  easing: EasingFn;
  startTime: number;
  current: number;
  done: boolean;
}

/** @brief Create a new animation starting at `from`, heading to `to`. @param {number} from - start value. @param {number} to - end value. @param {number} duration - duration in ms. @param {EasingFn} [easing] - optional easing (defaults to linear). @return {Animation} fresh animation at t=0. @since 0.1.2 */
export function createAnimation(
  from: number,
  to: number,
  duration: number,
  easing: EasingFn = linear,
): Animation {
  return {
    from,
    to,
    duration,
    easing,
    startTime: Number.NaN,
    current: from,
    done: false,
  };
}

/** @brief Step an animation forward to `now`, returning a new immutable record. @param {Animation} anim - current animation state. @param {number} now - timestamp in ms; also sets startTime on first call. @return {Animation} next animation state. @since 0.1.2 */
export function stepAnimation(anim: Animation, now: number): Animation {
  const startTime = Number.isNaN(anim.startTime) ? now : anim.startTime;
  const value = tween(anim.from, anim.to, anim.duration, anim.easing, now, startTime);
  const elapsed = now - startTime;
  const done = anim.duration <= 0 || elapsed >= anim.duration;
  return {
    from: anim.from,
    to: anim.to,
    duration: anim.duration,
    easing: anim.easing,
    startTime,
    current: done ? anim.to : value,
    done,
  };
}

/** @brief True when the animation has reached its end. @param {Animation} anim - animation to test. @return {boolean} whether the animation is done. @since 0.1.2 */
export function isDone(anim: Animation): boolean {
  return anim.done;
}