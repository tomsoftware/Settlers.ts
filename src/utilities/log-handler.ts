import { LogManager, LogType } from './log-manager';

/** handel error logging */
export class LogHandler {
    private readonly _moduleName: string;
    private static manager = new LogManager();

    constructor(moduleName: string) {
        this._moduleName = moduleName;
    }

    /** log an error */
    public error(msg: string, exception?: Error) : void {
        LogHandler.manager.push({
            type: LogType.Error,
            source: this._moduleName,
            msg,
            exception
        });
    }

    /** write a debug message. If [msg] is not a String it is displayed: as {prop:value} */
    public debug(msg: string | any): void {
        LogHandler.manager.push({
            type: LogType.Debug,
            source: this._moduleName,
            msg
        });
    }

    public static getLogManager(): LogManager {
        return this.manager;
    }
}
