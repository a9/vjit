import { Disposable } from './disposable'

export class EventChannel extends Disposable {
  private namespace: string
  private host: Element
  constructor(namespace: string) {
    super()
    this.host = document as Node as Element
    this.namespace = namespace
  }

  type(name: string) {
    return `${this.namespace}:${name}`
  }

  on(
    name: string,
    fn: (e: Event) => void,
    options?: boolean | AddEventListenerOptions,
  ) {
    const type = this.type(name)

    this.host.addEventListener(type, fn, options)

    if (typeof options === 'object' && options.once) {
      this.host.removeEventListener(type, fn)
      return
    }

    this.disposes.push(() => {
      this.host.removeEventListener(type, fn)
    })
  }

  once(name: string, fn: (e: Event) => void) {
    return this.on(name, fn, { once: true })
  }

  emit<T = unknown>(name: string, data?: T) {
    const event = createEvent(this.type(name), data)
    this.host.dispatchEvent(event)
  }
}

export const createEvent = <T = unknown>(name: string, data: T) => {
  return new CustomEvent(name, {
    detail: data,
    bubbles: true,
    cancelable: true,
  })
}
