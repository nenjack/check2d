export type BaseFunction = () => void

/**
 * Utility clock/loop class
 */
export class Clock {
  readonly delay: number
  readonly events: BaseFunction[] = []

  /**
   * Fire each event then issue next tic
   */
  readonly toc: BaseFunction

  /**
   * @param delay {number} how long between setTimeout tic-toc
   */
  constructor(delay: number = 0) {
    this.delay = delay

    this.toc = () => {
      if (!this.events.length) {
        return
      }

      this.events.forEach((event: () => void) => {
        event()
      })

      this.tic()
    }
  }

  /**
   * Issue next toc after delay with set timeout
   */
  tic() {
    if (!this.events.length) {
      return
    }

    setTimeout(this.toc, this.delay)
  }

  /**
   * Add function to clock events
   * First add issues first tic
   * @param event {BaseFunction} function to add to events
   */
  add(event: BaseFunction) {
    this.events.push(event)

    if (this.events.length === 1) {
      this.tic()
    }
  }

  /**
   * Clear clock events
   */
  clear() {
    while (this.events.length) {
      this.events.pop()
    }
  }
}

export const clock = new Clock()
