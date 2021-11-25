export enum LogType {
    Error,
    Debug
}

export interface ILogMessage {
    type: LogType;
    source: string;
    msg: string | any;
    exception?: Error;
    index?: number;
}

export type LogMessageCallback = ((msg: ILogMessage) => void);

export class LogManager {
    public log: ILogMessage[] = [];
    private logMsgCount = 0;
    private listener: LogMessageCallback | null = null

    public onLogMessage(callback: LogMessageCallback | null): void {
        this.listener = callback;

        if (!callback) {
            return;
        }

        // send old messages
        for (const msg of this.log) {
            callback(msg);
        }
    }

    public push(msg: ILogMessage): void {
        msg.index = this.logMsgCount++;

        // save message to log
        this.log.push(msg);
        if (this.log.length > 100) {
            this.log.shift();
        }

        // publish to listener
        if (this.listener) {
            this.listener(msg);
        }

        // write out to console
        if (typeof msg.msg !== 'string') {
            console.dir(msg.msg);
        } else {
            if (msg.type === LogType.Debug) {
                console.log(msg.source + '\t' + msg.msg);
            } else {
                console.error(msg.source + '\t' + msg.msg);
            }
        }

        if (msg.exception) {
            console.error(msg.source + '\t' + msg.exception.message);
        }
    }
}
