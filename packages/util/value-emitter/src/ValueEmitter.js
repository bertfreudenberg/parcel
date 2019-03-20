// @flow strict-local

export interface IDisposable {
  dispose(): void;
}

// Like an EventEmitter, but for only a single "event". This provides type-safety
// for the values emitted. Rather than passing predetermined strings (which can
// be misspelled), create an instance of ValueEmitter for every logical "event"
// to be dispatched, and type it according to the type of value emitted.
export default class ValueEmitter<TValue> implements IDisposable {
  // An array of listeners. One might think a Set would be better for O(1) removal,
  // but splicing a JS array gets pretty close, and copying the array (as is done
  // in emit) is far faster than a Set copy: https://github.com/atom/event-kit/pull/39
  _listeners: Array<(value: TValue) => mixed> = [];

  addListener(listener: (value: TValue) => mixed): IDisposable {
    this._listeners.push(listener);

    return {
      dispose: () => {
        this._listeners.splice(this._listeners.indexOf(listener), 1);
      }
    };
  }

  emit(value: TValue): void {
    // Iterate over a copy of listeners. This prevents the following cases:
    // * When a listener callback can itself register a new listener and be
    //   emitted as part of this iteration.
    // * When a listener callback disposes of this emitter mid-emit, preventing
    //   other listeners from receiving the event.
    let listeners = this._listeners.slice();
    for (let i = 0; i < listeners.length; i++) {
      listeners[i](value);
    }
  }

  dispose() {
    this._listeners = [];
  }
}
