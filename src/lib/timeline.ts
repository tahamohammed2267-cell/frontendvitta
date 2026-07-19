// Drives every scripted sequence (upload, extraction pipeline, output
// generation, chat streaming) from a list of steps with real timing, so
// pacing for all of them is tunable in one place instead of scattered
// setTimeout calls. Presenter hotkeys (see Layout.tsx) reach the
// currently-running sequence through getActiveTimeline() to skip/complete it.
export interface TimelineStep {
  durationMs: number;
  onStart?: () => void;
}

export interface TimelineHandle {
  /** Jump straight to the end of the current step. */
  skip: () => void;
  /** Jump straight to the end of the whole sequence. */
  complete: () => void;
  /** Stop without running remaining onStart callbacks. */
  cancel: () => void;
}

let active: TimelineHandle | null = null;

export function getActiveTimeline(): TimelineHandle | null {
  return active;
}

export function runTimeline(steps: TimelineStep[], onDone?: () => void): TimelineHandle {
  let index = -1;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let done = false;

  function clear() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function finish() {
    if (done) return;
    done = true;
    clear();
    if (active === handle) active = null;
    onDone?.();
  }

  function advance() {
    index += 1;
    if (index >= steps.length) {
      finish();
      return;
    }
    steps[index].onStart?.();
    timer = setTimeout(advance, steps[index].durationMs);
  }

  const handle: TimelineHandle = {
    skip: () => {
      if (done) return;
      clear();
      advance();
    },
    complete: () => {
      if (done) return;
      clear();
      while (index < steps.length - 1) {
        index += 1;
        steps[index].onStart?.();
      }
      finish();
    },
    cancel: () => {
      done = true;
      clear();
      if (active === handle) active = null;
    },
  };

  active = handle;
  advance();
  return handle;
}
