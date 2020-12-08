import React, { Suspense } from 'react';
import { createExternalSubject, useExternalSubject } from 'react-external-subject';

const increment = document.getElementById('increment');
const incrementMulti = document.getElementById('increment-multi');
const incrementAuto = document.getElementById('increment-auto');

class Counter {
  private value = 0;

  private listeners = new Set<() => void>();

  get state() {
    return this.value;
  }

  set state(value: number) {
    this.value = value;

    this.listeners.forEach((listener) => {
      listener();
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
};

const source = new Counter();

increment?.addEventListener('click', () => {
  source.state += 1;
});
incrementMulti?.addEventListener('click', () => {
  source.state += 1;
  source.state += 1;
});

let raf: number | undefined;

function begin() {
  source.state += 1;
  raf = requestAnimationFrame(begin);
}

incrementAuto?.addEventListener('click', () => {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = undefined;
  } else {
    raf = requestAnimationFrame(begin);
  }
});

// Wrap our mutable source into an external subject
const subject = createExternalSubject({
  read: () => source.state,
  subscribe: (handler) => source.subscribe(handler),
});

function Observer() {
  const value = useExternalSubject(subject, true);
  return <div>{value}</div>;
}

function hash() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
}

function App() {
  const items = [];
  for (let i = 0; i < 500; i += 1) {
    items.push(<Observer key={hash()} />)
  }
  return (
    <Suspense fallback={null}>
      {items}
    </Suspense>
  );
}

export default App
