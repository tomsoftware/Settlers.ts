/**
* Handle path name modification
*/
export class Path {
	/** fix the path separator */
	public static fixPath(path:string):string {
		return path.split('\\').join('/');
	}

	/** add an ending path separator */
	public static addEndingSlash(path:string):string {
		if ((path[path.length - 1] === '/') || (path[path.length - 1] === '\\')) {
			return path;
		}

		return path + '/';
	}

	/** add a filename to a path */
	public static combine(path1?:string, path2?:string, path3?:string):string {
		if (!path1 && !path2 && !path3) {
			return '';
		}

		if (!path1) {
			return Path.combine(path2, path3);
		}

		let p = path1;

		if (path2) {
			p = Path.addEndingSlash(p) + path2;
		}

		if (path3) {
			p = Path.addEndingSlash(p) + path3;
		}

		return p;
	}

	/** return the filename of a file path */
	public static getFileName(fullFileName:string):string {
		const pos = fullFileName.lastIndexOf('/');
		if (pos < 0) {
			return fullFileName;
		}

		if ((pos + 1) >= fullFileName.length) {
			return '';
		}

		return fullFileName.substr(pos + 1);
	}

	/** return only the filename without the Extension e.g. "c:/abc/test.txt" -> "test" */
	public static getFileNameWithoutExtension(fullFileName:string):string {
		const fileName = Path.getFileName(fullFileName);
		const pos = fileName.lastIndexOf('.');
		if (pos < 0) {
			return fileName;
		}

		return fileName.substr(0, pos);
	}

	/** return the path of a filename */
	public static getPathName(fullFileName:string):string {
		const pos = fullFileName.lastIndexOf('/');
		if (pos <= 0) {
			return '';
		}

		return fullFileName.substr(0, pos);
	}
}
