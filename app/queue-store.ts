export type Customer = {
  id: number;
  name: string;
};

export type QueueState = {
  queue: Customer[];
  currentCustomer: Customer | null;
  nextNumber: number;
};

export const defaultQueueState: QueueState = {
  queue: [],
  currentCustomer: null,
  nextNumber: 1,
};

const STORAGE_KEY = "queueboard-state";

let snapshot: QueueState = defaultQueueState;
let initialized = false;

const listeners = new Set<() => void>();

function readFromStorage(): QueueState {
  if (typeof window === "undefined") {
    return defaultQueueState;
  }

  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    return defaultQueueState;
  }

  try {
    return JSON.parse(savedState) as QueueState;
  } catch {
    return defaultQueueState;
  }
}

export function subscribe(callback: () => void) {
  listeners.add(callback);

  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    snapshot = readFromStorage();
    callback();
  }

  function handleStorageChange() {
    snapshot = readFromStorage();
    callback();
  }

  window.addEventListener("storage", handleStorageChange);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function getSnapshot(): QueueState {
  return snapshot;
}

export function getServerSnapshot(): QueueState {
  return defaultQueueState;
}

export function updateQueueState(
  update: (currentState: QueueState) => QueueState
) {
  snapshot = update(snapshot);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  listeners.forEach((listener) => listener());
}