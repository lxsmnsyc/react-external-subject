export type ExternalSubjectSubscribe =
  (handler: () => void) => void | undefined | (() => void);

export type ExternalSubjectShouldUpdate<T> =
  (a: T, b: T) => boolean;

export interface ExternalSubjectOptions<T> {
  read: () => T;
  subscribe?: ExternalSubjectSubscribe;
  shouldUpdate?: ExternalSubjectShouldUpdate<T>;
  lazySubscribe?: boolean;
}

export interface UpdateRequest {
  promise: Promise<void>;
  alive: boolean;
}

export interface ExternalSubject<T> {
  /**
   * Reads the latest value
   */
  getCurrentValue: () => T;

  /**
   * Reads the latest validated value
   */
  getCachedValue: () => T;

  /**
   * Gets the ongoing validation request
   */
  getRequest: () => UpdateRequest | undefined;

  requestUpdate: () => void;

  /**
   * Used for comparing the values
   */
  shouldUpdate: ExternalSubjectShouldUpdate<T>;
  subscribe: ExternalSubjectSubscribe;

  destroy: () => void;
}
