import './polyfill'

import {
  match,
  MatchOptions,
  ParamData,
  ParseOptions,
  Path,
} from 'path-to-regexp'
import { Disposable, EventChannel, generateId } from '../core'

export type Context<T extends ParamData = any> = {
  req: Request
  params: T

  json: (data: unknown) => Response
}

export class Ipc extends Disposable {
  id: string
  namespace: string
  request: EventChannel
  response: EventChannel
  constructor(namespace = generateId(16)) {
    super()
    this.id = generateId(16)
    this.namespace = namespace

    this.request = new EventChannel(`${namespace}:request`)
    this.response = new EventChannel(`${namespace}:response`)

    this.disposes.push(this.request, this.response)
  }

  match<P extends ParamData>(
    request: Request,
    path: Path | Path[],
    options?: MatchOptions & ParseOptions,
  ) {
    const url = new URL(request.url)

    const route = match<P>(path, options)(url.pathname)
    if (!route) {
      return false
    }

    const context: Context<P> = {
      req: request,
      params: route.params,
      json(data) {
        return Response.json(data)
      },
    }

    return context
  }

  fetch(input: RequestInfo | URL, init?: RequestInit) {
    return this.invoke(input, init)
  }

  serve(options: { fetch: (req: Request) => Promise<Response | undefined> }) {
    return this.handle(options.fetch)
  }

  private handle(fn: (req: Request) => Promise<Response | undefined>) {
    this.request.on(this.id, async (e: Event) => {
      const request = (e as CustomEvent<Request>).detail
      const id = request.headers.get('x-request-id') as string

      const response = await fn(request)
      if (response instanceof Response) {
        this.response.emit(id, response)
      }
    })
  }

  private invoke(input: RequestInfo | URL, init?: RequestInit) {
    const { promise, resolve } = Promise.withResolves<Response>()

    const id = generateId(16)

    this.response.on(id, (e) => resolve((e as CustomEvent<Response>).detail))

    const req = new Request(input, init)
    req.headers.set('x-request-id', id)

    this.request.emit(this.id, req)

    return promise
  }
}
