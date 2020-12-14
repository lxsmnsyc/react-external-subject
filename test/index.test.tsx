import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  createExternalSubject,
  ExternalSubjectSynchronizer,
  useExternalSubject,
} from '../src';

describe('useExternalSubject', () => {
  it('should be able to detect tearing after use', async () => {
    let source = 0;

    const subject = createExternalSubject({
      read: () => source,
    });

    const Read = () => {
      const value = useExternalSubject(subject, false);
      return <h1 title="reader">{value}</h1>;
    };

    const Effectful = () => {
      source = 1;
      return <h1>Effectful</h1>;
    };

    render((
      <ExternalSubjectSynchronizer>
        <Read />
        <Effectful />
      </ExternalSubjectSynchronizer>
    ));

    expect(await waitFor(() => screen.getByTitle('reader'))).toContainHTML('1');
  });
  it('should be able to detect tearing before use', async () => {
    let source = 0;

    const subject = createExternalSubject({
      read: () => source,
    });

    const Read = () => {
      const value = useExternalSubject(subject, false);
      return <h1 title="reader">{value}</h1>;
    };

    const Effectful = () => {
      source = 1;
      return <h1>Effectful</h1>;
    };

    render((
      <ExternalSubjectSynchronizer>
        <Effectful />
        <Read />
      </ExternalSubjectSynchronizer>
    ));

    expect(await waitFor(() => screen.getByTitle('reader'))).toContainHTML('1');
  });
  it('should be able to detect tearing inbetween effects', async () => {
    let source = 0;

    const subject = createExternalSubject({
      read: () => source,
    });

    const Read = () => {
      const value = useExternalSubject(subject, false);
      return <h1 title="reader">{value}</h1>;
    };

    const Effectful = ({ value }: { value: number }) => {
      source = value;
      return <h1>Effectful</h1>;
    };

    render((
      <ExternalSubjectSynchronizer>
        <Effectful value={2} />
        <Read />
        <Effectful value={1} />
      </ExternalSubjectSynchronizer>
    ));

    expect(await waitFor(() => screen.getByTitle('reader'))).toContainHTML('1');
  });
  it('should be able to detect tearing inbetween effects on simultaneous reads', async () => {
    let source = 0;

    const subject = createExternalSubject({
      read: () => source,
    });

    const Read = () => {
      const value = useExternalSubject(subject, false);
      return <h1 title="reader">{value}</h1>;
    };

    const SecondRead = () => {
      const value = useExternalSubject(subject, false);
      return <h1 title="reader-2">{value}</h1>;
    };

    const Effectful = ({ value }: { value: number }) => {
      source = value;
      return <h1>Effectful</h1>;
    };

    render((
      <ExternalSubjectSynchronizer>
        <Effectful value={2} />
        <Read />
        <Effectful value={1} />
        <SecondRead />
      </ExternalSubjectSynchronizer>
    ));

    expect(await waitFor(() => screen.getByTitle('reader'))).toContainHTML('1');
    expect(await waitFor(() => screen.getByTitle('reader-2'))).toContainHTML('1');
  });
  it('should be able to detect tearing before use on Suspense', async () => {
    let source = 0;

    const subject = createExternalSubject({
      read: () => source,
    });

    const Read = () => {
      const value = useExternalSubject(subject, true);
      return <h1 title="reader">{value}</h1>;
    };

    const Effectful = () => {
      source = 1;
      return <h1>Effectful</h1>;
    };

    render((
      <ExternalSubjectSynchronizer>
        <Read />
        <Effectful />
      </ExternalSubjectSynchronizer>
    ));

    expect(await waitFor(() => screen.getByTitle('reader'))).toContainHTML('1');
  });
  it('should be able to detect tearing before use on Suspense', async () => {
    let source = 0;

    const subject = createExternalSubject({
      read: () => source,
    });

    const Read = () => {
      const value = useExternalSubject(subject, true);
      return <h1 title="reader">{value}</h1>;
    };

    const Effectful = () => {
      source = 1;
      return <h1>Effectful</h1>;
    };

    render((
      <ExternalSubjectSynchronizer>
        <Effectful />
        <Read />
      </ExternalSubjectSynchronizer>
    ));

    expect(await waitFor(() => screen.getByTitle('reader'))).toContainHTML('1');
  });
  it('should be able to detect tearing inbetween effects on Suspense', async () => {
    let source = 0;

    const subject = createExternalSubject({
      read: () => source,
    });

    const Read = () => {
      const value = useExternalSubject(subject, true);
      return <h1 title="reader">{value}</h1>;
    };

    const Effectful = ({ value }: { value: number }) => {
      source = value;
      return <h1>Effectful</h1>;
    };

    render((
      <ExternalSubjectSynchronizer>
        <Effectful value={2} />
        <Read />
        <Effectful value={1} />
      </ExternalSubjectSynchronizer>
    ));

    expect(await waitFor(() => screen.getByTitle('reader'))).toContainHTML('1');
  });
  it('should be able to detect tearing inbetween effects on simultaneous reads on Suspense', async () => {
    let source = 0;

    const subject = createExternalSubject({
      read: () => source,
    });

    const Read = () => {
      const value = useExternalSubject(subject, true);
      return <h1 title="reader">{value}</h1>;
    };

    const SecondRead = () => {
      const value = useExternalSubject(subject, true);
      return <h1 title="reader-2">{value}</h1>;
    };

    const Effectful = ({ value }: { value: number }) => {
      source = value;
      return <h1>Effectful</h1>;
    };

    render((
      <ExternalSubjectSynchronizer>
        <Effectful value={2} />
        <Read />
        <Effectful value={1} />
        <SecondRead />
      </ExternalSubjectSynchronizer>
    ));

    expect(await waitFor(() => screen.getByTitle('reader'))).toContainHTML('1');
    expect(await waitFor(() => screen.getByTitle('reader-2'))).toContainHTML('1');
  });
});
