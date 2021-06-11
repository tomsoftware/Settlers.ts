import { LogHandler } from '@/utilities/log-handler';
import { Path } from '@/utilities/path';
import { BinaryReader } from './binary-reader';

class RequestError extends Error {
  public state: number;
  public statusText: string;

  constructor(state: number, msg: string) {
    super(msg);
    this.statusText = msg;
    this.state = state;

    Object.seal(this);
  }
}

/**
* Handle Files loading from remote/web
*/
export class FileProvider {
  private log: LogHandler = new LogHandler('FileProvider');
  private rootPath?: string;

  constructor(rootPath?: string) {
    this.rootPath = rootPath;

    Object.seal(this);
  }

  /** load binary data from URL: rootPath + [path] + filename */
  public loadBinary(path: string, filename?: string): Promise<BinaryReader> {
    const url = Path.combine(this.rootPath, path, filename);

    this.log.debug('loading: ' + url);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const reader = new BinaryReader(xhr.response, 0, undefined, this.filenameFormUrl(url));

          resolve(reader);
        } else {
          this.log.error('error load file:' + url);
          reject(new RequestError(xhr.status, xhr.statusText));
        }
      };

      xhr.onerror = () => {
        this.log.error('error load file:' + url);
        reject(new RequestError(xhr.status, xhr.statusText));
      };

      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';

      xhr.send();
    });
  }

  /** load string data from URL */
  public loadString(url: string): Promise<string> {
    this.log.debug('Load file as string: ' + url);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = () => {
        resolve(xhr.response);
      };

      xhr.onerror = () => {
        this.log.error('error load file:' + url);
        reject(new RequestError(xhr.status, xhr.statusText));
      };

      /// setup query
      xhr.open('GET', url, true);
      xhr.responseType = 'text';

      /// call url
      xhr.send(null);
    });
  }

  /** Extracts the filename form an URL */
  private filenameFormUrl(url: string): string {
    if (url === '') {
      return '';
    }

    url = url.substring(0, (url.indexOf('#') === -1) ? url.length : url.indexOf('#'));
    url = url.substring(0, (url.indexOf('?') === -1) ? url.length : url.indexOf('?'));
    url = url.substring(url.lastIndexOf('/') + 1, url.length);

    return url;
  }
}
