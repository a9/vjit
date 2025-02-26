import './polyfill'

import { match, MatchOptions, ParseOptions, Path } from 'path-to-regexp'
import { Disposable, EventChannel, generateId } from '../core'

type ExtractRouteParams<T> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<Rest>
  : T extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : T extends `${string}*`
      ? {}
      : {}

export type Context<T> = {
  params: ExtractRouteParams<T>

  json: (data: unknown) => Response
}

type RouteHandler<T extends string> = (
  req: Request,
  context: Context<T>,
) => Response | void | Promise<Response | void>

type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'

type RouteHandlerObject<T extends string> = {
  [K in HTTPMethod]?: RouteHandler<T>
}

type RouteValue<T extends string> =
  | Response
  | false
  | RouteHandler<T>
  | RouteHandlerObject<T>

const createContext = <T extends string>(
  request: Request,
  path: Path | Path[],
  options?: MatchOptions & ParseOptions,
) => {
  const url = new URL(request.url)

  const route = match<ExtractRouteParams<T>>(path, options)(url.pathname)
  if (!route) {
    return false
  }

  const context: Context<T & string> = {
    params: route.params,
    json(data) {
      return Response.json(data)
    },
  }

  return context
}

type Fetch = (req: Request) => Response | void | Promise<Response | void>

const serve = <R>(fetch: Fetch, routes: R) => {
  return (request: Request) => {
    for (const [path, value] of Object.entries(routes as object)) {
      if (value instanceof Response) {
        return value
      }
      if (value === false) {
        return
      }

      const context = createContext(request, path)

      if (context) {
        if (typeof value === 'object') {
          for (const [method, handler] of Object.entries(value as object)) {
            if (request.method.toLowerCase() === method.toLowerCase()) {
              return handler(request, context)
            }
          }
        }

        if (typeof value === 'function') {
          const handler = value
          return handler(request, context)
        }
      }
    }

    return fetch(request)
  }
}

export class Ipc extends Disposable {
  private id: string
  // private namespace: string
  private request: EventChannel
  private response: EventChannel
  constructor(namespace = generateId(16)) {
    super()
    this.id = generateId(16)
    // this.namespace = namespace

    this.request = new EventChannel(`${namespace}:request`)
    this.response = new EventChannel(`${namespace}:response`)

    this.disposes.push(this.request, this.response)
  }

  fetch(input: RequestInfo | URL, init?: RequestInit) {
    return this.invoke(input, init)
  }

  serve<R extends { [K in keyof R]: RouteValue<K & string> }>({
    routes,
    fetch = async () => {
      return new Response('Not Found', { status: 404 })
    },
  }: {
    routes: R
    fetch?: (req: Request) => Response | Promise<Response>
  }) {
    return this.handle(serve(fetch, routes))
  }

  private handle(
    fn: (req: Request) => Response | void | Promise<Response | void>,
  ) {
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
