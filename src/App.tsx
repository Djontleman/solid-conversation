import type { Component } from 'solid-js';
import {
  createSignal,
  For,
  createResource,
  Show,
  Suspense,
  createEffect,
} from 'solid-js';

import styles from './App.module.css';

const fetchQuotes = async () =>
  (await fetch('https://animechan.vercel.app/api/quotes')).json();

const [confirmStart, setConfirmStart] = createSignal(false);
const [quotes, { refetch: refetchQuotes }] = createResource(
  confirmStart,
  fetchQuotes
);
const [quoteIndex, setQuoteIndex] = createSignal(-1);

function Line(props: { personNumber: number; quote: string; wait: number }) {
  const [display, setDisplay] = createSignal(false);

  createEffect(async () => {
    if (quoteIndex() >= 0) {
      setDisplay(false);
      await new Promise((resolve) => setTimeout(resolve, props.wait));
      setDisplay(true);
    }
  });

  return (
    <Show when={display()}>
      <p>
        Person {props.personNumber}: {props.quote}
      </p>
    </Show>
  );
}

function Conversation() {
  const handleConfirmStart = () => {
    setConfirmStart(true);
    setQuoteIndex(0);
  };

  const handleConfirm = async () => {
    setQuoteIndex(quoteIndex() + 3);

    if (quoteIndex() % 9 === 0) {
      refetchQuotes();
    }
  };

  const personNumbers = [1, 2, 1];

  return (
    <>
      <Show when={!confirmStart()}>
        <button onClick={handleConfirmStart}>gimme a convo</button>
      </Show>
      <Suspense fallback={<div>Loading</div>}>
        <Show when={quotes()}>
          <For each={personNumbers}>
            {(personNumber, i) => (
              <div>
                <Line
                  personNumber={personNumber}
                  quote={quotes()[i() + (quoteIndex() % 9)].quote}
                  wait={i() * 1500}
                />
              </div>
            )}
          </For>
          <button onClick={handleConfirm}>another convo</button>
        </Show>
      </Suspense>
    </>
  );
}

const App: Component = () => {
  return (
    <main class={styles.App}>
      <p class={styles.title}>completely normal conversation generator</p>
      <Conversation />
    </main>
  );
};

export default App;
