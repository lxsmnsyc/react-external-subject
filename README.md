# react-external-subject

> Turn third-party mutable sources into React-safe source

[![NPM](https://img.shields.io/npm/v/react-external-subject.svg)](https://www.npmjs.com/package/react-external-subject) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/github/LXSMNSYC/react-external-subject/tree/main/example/)

## Install

```bash
yarn add react-external-subject
```

## Usage

```tsx
import {
  ExternalSubjectSynchronizer,
  createExternalSubject,
  useExternalSubject,
  } from 'react-external-subject';

// An example of a mutable source
let source = 0;

// Wrap our mutable source into an external subject
const subject = createExternalSubject({
  read: () => source,
});

// Create a component that reads from our mutable source
function ObserverA() {
  const value = useExternalSubject(subject, false);
  return <h1>Value: {value}</h1>;
}

// Create a component similar to ObserverA but suspends
function ObserverB() {
  const value = useExternalSubject(subject, true);
  return <h1>Value: {value}</h1>;
}

// Create a component with a render-time side-effect
function Effectful() {
  // Update our source
  source = 1337;
  return <h1>Effectful: {source}</h1>;
}

function App() {
  return (
    <ExternalSubjectSynchronizer>
      <ObserverA />
      <Effectful />
      {/*
        By the time ObserverB renders, the source has already 
        updated, creating a "tear".
      */}
      <ObserverB />
    </ExternalSubjectSynchronizer>
  );
}
```

## Features

`react-external-subject` is a library that wraps mutable sources not usually managed by React into a React-safe external subject.

When a component subscribes to an external subject, the external subject maintains and keeps track of a state that is safe for all components to share and render.

If it detects a tear in between renders, or between render and commit phase, the external subject asynchronously requests an update to the safe state and notifies all components to update their received value.

Components with suspense mode active will suspend until they receive the new safe state.

### Memoization

External subjects may receive a memoization option through `options.shouldUpdate`. This function is used internally to compare the proposed state and the safe state. By default, it uses the `Object.is` function.

### Subscription

External subjects may subscribe to a mutable source through `options.subscribe`. This function receives a callback that is used to subscribe to the source for receiving updates. `options.subscribe` may return a cleanup function, potentially for cleaning subscription.

### Lazy Subscription

External subjects may lazily subscribe/unsubscribe through `options.lazySubscribe`. When set to true, subjects only begins subscribing to the mutable source when a listener is attached to them (e.g. through `useExternalSubject`.). If the subject has zero listeners, the subject automatically unsubscribes. By default, external subjects subscribes immediately on creation and never unsubscribes.

### Hook

`useExternalSubject(subject, suspense = false)` is used to observe external subjects' state. If `suspense` is set to false, `useExternalSubject` will return the last safe state if it detects a tearing during render, otherwise, `useExternalSubject` suspends the component until the new safe state is updated. Regardless, `useExternalSubject` will always guarantee that the component will receive a state that is safe to render as well as all of the components will receive the same value, preventing the UI from tearing.

### Alternatives

- [`use-subscription`](https://www.npmjs.com/package/use-subscription) provides a mechanism that allows the component to update immediately when it detects that the value has gone stale between render and commit phase. However, this does not prevent the component from tearing during render phase alone.
- [`useMutableSource`](https://github.com/reactjs/rfcs/blob/master/text/0147-use-mutable-source.md) is an upcoming first-party React hook that wraps mutable sources into React-safe (Concurrent-safe, that is) mutable sources. The hook is also partially the basis of this whole library, the difference is that `useMutableSource` keeps tracks of the mutable source's version in contrast with `useExternalSubject` that keeps tracks the state of the mutable source. `useMutableSource` also works with the internal Fiber architecture to handle tearing.

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
