/** handel error logging */
export class LogHandler {
  private readonly _moduleName: string;

  constructor(moduleName: string) {
    this._moduleName = moduleName;
  }

  /** log an error */
  public error(msg: string, exception?: Error) : void {
    console.error(this._moduleName + '\t' + msg);

    if (exception) {
      console.error(this._moduleName + '\t' + exception.message);
    }
  }

  /** write a debug message. If [msg] is not a String it is displayed: as {prop:value} */
  public debug(msg: string | any): void {
    if (typeof msg === 'string') {
      console.log(this._moduleName + '\t' + msg);
    } else {
      console.dir(msg);
    }
  }
}
