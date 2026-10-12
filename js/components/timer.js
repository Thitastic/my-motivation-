import { formatDuration } from "../utils.js";

export class Timer {
  constructor(onTick) {
    this.onTick = onTick;
    this.interval = null;
    this.seconds = 0;
  }

  start(initial = 0) {
    this.stop();
    this.seconds = initial;
    this.interval = setInterval(() => {
      this.seconds += 1;
      this.onTick(this.seconds);
    }, 1000);
    this.onTick(this.seconds);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  static format(seconds) {
    return formatDuration(seconds);
  }
}
