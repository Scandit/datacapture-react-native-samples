export type TimerListener = {
  readonly didFireTimer: () => void
}

export class Timer {
  private static readonly ACCURATE_TIMEOUT = 2000
  private static readonly ITEM_TIMEOUT = 2500

  private _timer: number | undefined
  private readonly _timeout: number
  listener: TimerListener | undefined

  private constructor(timeout: number) {
    this._timeout = timeout
  }

  static accurateTimer() {
    return new Timer(Timer.ACCURATE_TIMEOUT)
  }

  static itemTimer() {
    return new Timer(Timer.ITEM_TIMEOUT)
  }

  readonly start = () => {
    this.stop()

    this._timer = setTimeout(() => {
      this.listener?.didFireTimer()
      this._timer = undefined
    }, this._timeout)
  }

  readonly startOrContinue = () => {
    if (this._timer) {
      return
    }

    this.start()
  }

  readonly stop = () => {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = undefined
    }
  }
}

