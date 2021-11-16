export interface IDisposable {
  dispose(): void;
}
export type Event<T> = (listener: (e: T) => any, thisArgs?: any) => IDisposable;
export type FileType = '-' | 'd';
export interface IStat {
  /**
   * The entry type character
     describes the type of file, as follows:
      d     Directory.
      -     Regular file.
   */
  type: FileType;
  /**
   * Each field has two character positions(only for Regular file):
      1.   If r, the file is readable; if -, it is not readable.
      2.   If w, the file is writable; if -, it is not writable.
   */
  permissions?: string;
  mtime: number;
  ctime: number;
  size: number;
}

export interface ICreateOption {
  overwrite?: boolean;
  force?: boolean; // if parent not exist, then create parent then create
}

// move and rename cause filePath change
export interface IFilesystemChangeEffect {
  moved?: { src: string; dest: string };
  added?: string;
  deleted?: string;
  contentedChanged?: string;
}

// backend file change
export interface IFilesystemSandboxChangeEffect {
  addedUri?: string;
  deletedUri?: string;
  updatedUri?: string;
}

export interface IFilesystemIndex {
  indexes: string[];
}

export interface IFileSystemService {
  readonly onFilesystemDidChange: Event<IFilesystemChangeEffect>;
  readonly onFileIndex: Event<IFilesystemIndex>;

  getAllPathByRegex(uri: string, regex: string): Promise<string[]>;
  openSync(uri: string): void;
  closeSync(uri: string): void;
  state(uri: string): Promise<IStat | null>;
  mkdir(uri: string): Promise<void>;
  readDir(uri: string): Promise<string[]>;
  download(uri: string, filename: string): Promise<void>;
  delete(uri: string): Promise<void>;

  copy(fromUri: string, toUri: string): Promise<string>;
  move(fromUri: string, toUri: string): Promise<string>;
  rename(fromUri: string, name: string): Promise<string>;
  readFile(uri: string): Promise<ArrayBuffer | string | null>;
  readFileString(uri: string): Promise<string>;
  writeFile(uri: string, content: Uint8Array | string): Promise<void>;
  writeFileString(uri: string, content: string): Promise<void>;
}
