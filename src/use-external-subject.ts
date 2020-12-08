import { useForceUpdate, useIsomorphicEffect } from '@lyonph/react-hooks';
import { ExternalSubject } from './types';

export default function useExternalSubject<T>(
  subject: ExternalSubject<T>,
  suspense = false,
): T {
  const forceUpdate = useForceUpdate();

  // Register effects
  useIsomorphicEffect(() => {
    const unsubscribe = subject.subscribe(forceUpdate);

    const afterOngoing = subject.getRequest();
    if (afterOngoing) {
      forceUpdate();
      return unsubscribe;
    }

    // Check for tearing
    subject.requestUpdate();
    const currentOngoing = subject.getRequest();
    if (currentOngoing) {
      forceUpdate();
      return unsubscribe;
    }
    return unsubscribe;
  }, [subject]);

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
