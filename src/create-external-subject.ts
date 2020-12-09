import {
  ExternalSubject,
  ExternalSubjectOptions,
  ExternalSubjectSubscribe,
  UpdateRequest,
} from './types';

function defaultShouldUpdate<T>(a: T, b: T): boolean {
  return !Object.is(a, b);
}

interface CacheRef<T> {
  value: T;
}

export default function createExternalSubject<T>(
  options: ExternalSubjectOptions<T>,
): ExternalSubject<T> {
  const shouldUpdate = options.shouldUpdate ?? defaultShouldUpdate;

  let cache: CacheRef<T> | undefined;

  const listeners = new Set<() => void>();

  let request: UpdateRequest | undefined;

  const getCachedValue = () => {
    if (!cache) {
      cache = {
        value: options.read(),
      };
    }
    return cache.value;
  };

  const requestUpdate = () => {
    if (shouldUpdate(getCachedValue(), options.read())) {
      if (request) {
        request.alive = false;
      }
      request = {
        promise: Promise.resolve().then(() => {
          if (request?.alive) {
            request = undefined;

            if (cache) {
              cache.value = options.read();
            }

            listeners.forEach((listener) => {
              listener();
            });
          }
        }),
        alive: true,
      };
    }
  };

  let unsubscribe: (() => void) | undefined | void;

  const subscribe: ExternalSubjectSubscribe = (handler) => {
    listeners.add(handler);

    if (options.lazySubscribe && options.subscribe && listeners.size === 1) {
      const unsub = options.subscribe(requestUpdate);

      if (unsub) {
        unsubscribe = unsub;
      }
    }

    return () => {
      listeners.delete(handler);

      if (options.lazySubscribe && unsubscribe) {
        unsubscribe();
      }
    };
  };

  if (!options.lazySubscribe && options.subscribe) {
    unsubscribe = options.subscribe(requestUpdate);
  }

  const destroy = () => {
    if (request) {
      request.alive = false;
    }
    listeners.clear();
    if (unsubscribe) {
      unsubscribe();
    }
  };

  return {
    subscribe,
    shouldUpdate,
    requestUpdate,
    getRequest: () => request,
    getCachedValue,
    getCurrentValue: options.read,
    destroy,
  };
}
