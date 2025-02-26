type Dispose = { dispose: Dispose } | (() => void)

export abstract class Disposable {
  protected disposes: Dispose[] = []

  dispose() {
    this.disposes.forEach((v) => {
      if (typeof v === 'function') {
        v()
      } else if (typeof v.dispose === 'function') {
        v.dispose()
      }
    })
    this.disposes.length = 0
  }
}
