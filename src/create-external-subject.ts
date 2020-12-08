import {
  ExternalSubject,
  ExternalSubjectOptions,
  ExternalSubjectSubscribe,
  UpdateRequest,
} from './types';

function defaultShouldUpdate<T>(a: T, b: T): boolean {
  return !Object.is(a, b);
}

export default function createExternalSubject<T>(
  options: ExternalSubjectOptions<T>,
): ExternalSubject<T> {
  const shouldUpdate = options.shouldUpdate ?? defaultShouldUpdate;

  let cache = options.read();

  const listeners = new Set<() => void>();

  let request: UpdateRequest | undefined;

  const requestUpdate = () => {
    if (shouldUpdate(cache, options.read())) {
      if (request) {
        request.alive = false;
      }
      request = {
        promise: Promise.resolve().then(() => {
          if (request?.alive) {
            request = undefined;

            cache = options.read();

            listeners.forEach((listener) => {
              listener();
            });
          }
        }),
        alive: true,
      };
    }
  };

  const subscribe: ExternalSubjectSubscribe = (handler) => {
    listeners.add(handler);

    let unsubscribe: (() => void) | undefined;
    if (options.lazySubscribe && options.subscribe && listeners.size === 1) {
      const unsub = options.subscribe(requestUpdate);

      if (unsub) {
        unsubscribe = unsub;
      }
    }

    return () => {
      listeners.delete(handler);

      unsubscribe?.();
    };
  };

  if (!options.lazySubscribe && options.subscribe) {
    options.subscribe(requestUpdate);
  }

  return {
    subscribe,
    shouldUpdate,
    requestUpdate,
    getRequest: () => request,
    getCachedValue: () => cache,
    getCurrentValue: options.read,
  };
}
