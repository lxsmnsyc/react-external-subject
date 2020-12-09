import { useForceUpdate, useIsomorphicEffect } from '@lyonph/react-hooks';
import { useDebugValue } from 'react';
import { ExternalSubject } from './types';

function useExternalSubjectInternal<T>(
  subject: ExternalSubject<T>,
  suspense = false,
): T {
  const forceUpdate = useForceUpdate();

  // Subscribe to further updates
  useIsomorphicEffect(() => {
    const unsubscribe = subject.subscribe(forceUpdate);
    return unsubscribe;
  }, [subject]);

  // This effect makes sure that the component
  // is always up-to-date every re-render
  useIsomorphicEffect(() => {
    // If there's no ongoing request, try to request an update.
    if (!subject.getRequest()) {
      subject.requestUpdate();
      const ongoing = subject.getRequest();
      if (ongoing) {
        forceUpdate();
        return undefined;
      }
    }

    // Otherwise, schedule a state check on a latter time.
    const timeout = setTimeout(() => {
      const afterOngoing = subject.getRequest();
      if (afterOngoing) {
        forceUpdate();
        return;
      }

      // Check for tearing
      subject.requestUpdate();
      const currentOngoing = subject.getRequest();
      if (currentOngoing) {
        forceUpdate();
      }
    });

    return () => {
      clearTimeout(timeout);
    };
  }); // No dependencies

  const cached = subject.getCachedValue();

  // Suspend UI if there's an ongoing request
  const ongoing = subject.getRequest();
  if (ongoing) {
    if (suspense) {
      throw ongoing.promise;
    }
    return cached;
  }

  // Check for tearing
  subject.requestUpdate();
  // Suspend if tear is detected
  const current = subject.getRequest();
  if (current) {
    if (suspense) {
      throw current.promise;
    }
    return cached;
  }

  return subject.getCurrentValue();
}

export default function useExternalSubject<T>(
  subject: ExternalSubject<T>,
  suspense = false,
): T {
  const value = useExternalSubjectInternal(subject, suspense);
  useDebugValue(value);
  return value;
}
