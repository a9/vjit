if (typeof Promise.withResolves === 'undefined') {
  Promise.withResolves = <T>() => {
    let resolve: ((value: T | PromiseLike<T>) => void) | undefined
    let reject: ((reason?: any) => void) | undefined
    const promise = new Promise<T>((rs, rj) => {
      resolve = rs
      reject = rj
    })
    while (resolve === undefined || reject === undefined) {}

    return { promise, resolve, reject }
  }
}

declare global {
  interface PromiseConstructor {
    withResolves: <T = unknown>() => {
      promise: Promise<T>
      resolve: (value: T | PromiseLike<T>) => void
      reject: (reason?: any) => void
    }
  }
}
