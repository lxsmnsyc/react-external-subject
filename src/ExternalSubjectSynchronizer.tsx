import React, {
  createContext,
  ReactNode,
  Suspense,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useConstantCallback } from '@lyonph/react-hooks';
import { ExternalSubjectSynchronize } from './types';

const ExternalSubjectSynchronizerContext = (
  createContext<ExternalSubjectSynchronize | undefined>(undefined)
);

export function useExternalSubjectSynchronize(): ExternalSubjectSynchronize {
  const context = useContext(ExternalSubjectSynchronizerContext);

  if (context) {
    return context;
  }

  throw new Error('Found no synchronizer.');
}

interface ExternalSubjectSynchronizerProps {
  children: ReactNode;
}

export default function ExternalSubjectSynchronizer(
  { children }: ExternalSubjectSynchronizerProps,
): JSX.Element {
  const [state, setState] = useState<() => void>();

  const synchronize = useConstantCallback<ExternalSubjectSynchronize>((cb) => {
    setState(() => cb);
  });

  useEffect(() => {
    if (state) {
      state();
    }
  }, [state]);

  return (
    <ExternalSubjectSynchronizerContext.Provider value={synchronize}>
      <Suspense fallback={null}>
        { children }
      </Suspense>
    </ExternalSubjectSynchronizerContext.Provider>
  );
}
