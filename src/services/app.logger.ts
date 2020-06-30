import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends Logger {
  log(message: string) {
    super.log(message);
    this.cleanContext();
  }

  error(message: string, trace: string) {
    super.error(message, trace);
    this.cleanContext();
  }

  warn(message: string) {
    super.warn(message);
    this.cleanContext();
  }

  debug(message: string) {
    super.debug(message);
    this.cleanContext();
  }

  verbose(message: string) {
    super.verbose(message);
    this.cleanContext();
  }

  appendMethod(method: Function) {
    this.setContext(
      this.context && this.context.length > 1
        ? `${this.context}::${method.name}`
        : method.name,
    );
    return this;
  }
  public cleanContext() {
    this.setContext(this.context.split('::')[0]);
  }
}