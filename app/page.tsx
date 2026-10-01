"use client";

import { useState, useSyncExternalStore } from "react";

import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateQueueState,
  type Customer,
} from "./queue-store";

export default function Home() {

  const [customerName, setCustomerName] = useState("");
  const queueState = useSyncExternalStore(
  subscribe,
  getSnapshot,
  getServerSnapshot
);

const { queue, currentCustomer, nextNumber } = queueState;

  function addCustomer() {
    const name = customerName.trim();

    if (!name) {
      return;
    }

    const newCustomer: Customer = {
      id: nextNumber,
      name,
    };

    updateQueueState((currentState) => ({
    ...currentState,
     queue: [...currentState.queue, newCustomer],
     nextNumber: currentState.nextNumber + 1,
    }));
    setCustomerName("");
  }

  function callNextCustomer() {
    if (queue.length === 0) {
      return;
    }

    const [nextCustomer, ...remainingCustomers] = queue;

    updateQueueState((currentState) => ({
      ...currentState,
      currentCustomer: nextCustomer,
      queue: remainingCustomers,
      }));
  }

  function resetQueue() {
    updateQueueState(() => ({
      queue: [],
      currentCustomer: null,
      nextNumber: 1,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold shadow-lg shadow-indigo-500/20">
                Q
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                QueueBoard
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Simple queue management for busy service desks.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Desk Online
          </div>
        </header>

        {/* Current customer */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-slate-900 p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Currently Serving
            </p>

            <div className="mt-5 flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <span className="text-4xl font-black">
                {currentCustomer
                  ? `#${String(currentCustomer.id).padStart(3, "0")}`
                  : "—"}
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-bold">
              {currentCustomer?.name ?? "No customer being served"}
            </h2>

            <p className="mt-2 text-slate-400">
              {currentCustomer
                ? "This customer is currently being served."
                : "Call the next customer when you're ready."}
            </p>

            <button
              onClick={callNextCustomer}
              disabled={queue.length === 0}
              className="mt-7 rounded-xl bg-white px-8 py-3 font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Call Next
            </button>
          </div>
        </section>

        {/* Bottom grid */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Add customer */}
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                  New Customer
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Add to queue
                </h2>
              </div>

              <div className="rounded-xl bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-300">
                {queue.length} waiting
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="customer-name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Customer name
              </label>

              <div className="flex gap-3">
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addCustomer();
                    }
                  }}
                  placeholder="Enter a name"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                />

                <button
                  onClick={addCustomer}
                  className="rounded-xl bg-indigo-500 px-5 py-3 font-bold transition hover:bg-indigo-400"
                >
                  Add
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Press Enter to add the customer quickly.
              </p>
            </div>
          </div>

          {/* Waiting queue */}
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                  Waiting Queue
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Next in line
                </h2>
              </div>

              <span className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300">
                {queue.length} {queue.length === 1 ? "person" : "people"}
              </span>
            </div>

            {queue.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-5 py-10 text-center">
                <p className="font-medium text-slate-300">
                  The queue is empty.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add a customer to get started.
                </p>
              </div>
            ) : (
              <ol className="mt-5 space-y-3">
                {queue.map((customer, index) => (
                  <li
                    key={customer.id}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-950/70 p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-indigo-300">
                      {String(customer.id).padStart(3, "0")}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {customer.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        Position {index + 1}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* Footer actions */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            Queue data is saved in this browser.
          </p>

          <button
            onClick={resetQueue}
            className="rounded-xl border border-red-400/20 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
          >
            Reset Queue
          </button>
        </div>
      </div>
    </main>
  );
}