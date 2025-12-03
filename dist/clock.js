/**
 * Utility clock/loop class
 */
export class Clock {
  /**
   * @param delay {number} how long between setTimeout tic-toc
   */
  constructor(delay = 0) {
    this.events = []
    this.delay = delay
    this.toc = () => {
      if (!this.events.length) {
        return
      }
      this.events.forEach((event) => {
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
  add(event) {
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
