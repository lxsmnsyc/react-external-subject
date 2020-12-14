import {
  Subscription,
  useMemoCondition,
  useSubscription,
} from '@lyonph/react-hooks';
import { useDebugValue } from 'react';
import { useExternalSubjectSynchronize } from './ExternalSubjectSynchronizer';
import { ExternalSubject } from './types';

function useExternalSubjectInternal<T>(
  subject: ExternalSubject<T>,
  suspense = false,
): T {
  subject.setSynchronizer(useExternalSubjectSynchronize());

  const subscription = useMemoCondition((): Subscription<T> => ({
    read: () => subject.getCachedValue(),
    subscribe: (handler) => subject.subscribe(handler),
    shouldUpdate: (a, b) => subject.shouldUpdate(a, b),
  }), subject);

  const state = useSubscription(subscription);

  const ongoing = subject.getRequest();
  if (ongoing) {
    if (suspense) {
      throw ongoing.promise;
    }
  } else {
    // Check for tearing
    subject.requestUpdate();
    // Suspend if tear is detected
    const current = subject.getRequest();
    if (current) {
      if (suspense) {
        throw current.promise;
      }
    }
  }

  return state;
}

export default function useExternalSubject<T>(
  subject: ExternalSubject<T>,
  suspense = false,
): T {
  const value = useExternalSubjectInternal(subject, suspense);
  useDebugValue(value);
  return value;
}
