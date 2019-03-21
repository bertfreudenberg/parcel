// @flow strict-local

import type {IDisposable, LogEvent} from '@parcel/types';

import {ValueEmitter} from '@parcel/events';
import {inspect} from 'util';

class Logger {
  _logEmitter: ValueEmitter<LogEvent> = new ValueEmitter();

  onLog(cb: (event: LogEvent) => mixed): IDisposable {
    return this._logEmitter.addListener(cb);
  }

  verbose(message: string): void {
    this._logEmitter.emit({
      type: 'log',
      level: 'verbose',
      message
    });
  }

  info(message: string): void {
    this.log(message);
  }

  log(message: string): void {
    this._logEmitter.emit({
      type: 'log',
      level: 'info',
      message
    });
  }

  warn(err: Error | string): void {
    this._logEmitter.emit({
      type: 'log',
      level: 'warn',
      message: err
    });
  }

  error(err: Error | string): void {
    this._logEmitter.emit({
      type: 'log',
      level: 'error',
      message: err
    });
  }

  progress(message: string): void {
    this._logEmitter.emit({
      type: 'log',
      level: 'progress',
      message
    });
  }
}

const logger = new Logger();
export default logger;

let consolePatched;
export function patchConsole() {
  if (consolePatched) {
    return;
  }

  /* eslint-disable no-console */
  // $FlowFixMe
  console.log = (...messages: Array<mixed>) => {
    logger.info(messages.map(m => inspect(m)).join(' '));
  };

  // $FlowFixMe
  console.warn = message => {
    logger.warn(message);
  };

  // $FlowFixMe
  console.error = message => {
    logger.error(message);
  };
  /* eslint-enable no-console */

  consolePatched = true;
}
