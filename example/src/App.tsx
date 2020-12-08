import React, { Suspense } from 'react';
import { createExternalSubject, useExternalSubject } from 'react-external-subject';

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
    <>
      <ObserverA />
      <Effectful />
      {/*
        By the time ObserverB renders, the source has already 
        updated, creating a "tear".
      */}
      <Suspense fallback={null}>
        <ObserverB />
      </Suspense>
    </>
  );
}

export default App
