import { LogHandler } from '@/utilities/log-handler';
import { ILogMessage } from '@/utilities/log-manager';
import { Options, Vue } from 'vue-class-component';

@Options({
    name: 'LoggingView',
    props: {
    },
    components: {
    }
})
export default class LoggingView extends Vue {
    protected logs: ILogMessage[] = [];

    public beforeUnmount(): void {
        // remove log listener
        LogHandler.getLogManager().onLogMessage(null);
    }

    public mounted(): void {
        // display log
        LogHandler.getLogManager().onLogMessage((msg) => {
            if (this.logs.length > 40) {
                this.logs.shift();
            }

            this.logs.push(msg);
        });
    }
}
