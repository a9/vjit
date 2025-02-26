import { Disposable } from './disposable'

export class EventChannel extends Disposable {
  private namespace: string
  private host: Element
  constructor(namespace: string) {
    super()
    this.host = document as Node as Element
    this.namespace = namespace
  }

  createType(name: string) {
    return `${this.namespace}:${name}`
  }

  on(
    name: string,
    fn: (e: Event) => void,
    options?: boolean | AddEventListenerOptions,
  ) {
    const type = this.createType(name)

    this.host.addEventListener(type, fn, options)
    this.disposes.push(() => {
      this.host.removeEventListener(type, fn)
    })
  }

  emit<T = unknown>(name: string, data?: T) {
    const event = createEvent(this.createType(name), data)
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
