/* eslint-disable @typescript-eslint/member-ordering */
declare module 'chainIDE' {
  export class Disposable {
    /**
     * Combine many disposable-likes into one. Use this method
     * when having objects with a dispose function which are not
     * instances of Disposable.
     *
     * @param disposableLikes Objects that have at least a `dispose`-function member.
     * @return Returns a new disposable which, upon dispose, will
     * dispose all provided disposables.
     */
    static from(...disposableLikes: Array<{ dispose: () => any }>): Disposable;

    /**
     * Creates a new Disposable calling the provided function
     * on dispose.
     * @param callOnDispose Function that disposes something.
     */
    constructor(callOnDispose: Function);

    /**
     * Dispose this object.
     */
    dispose(): any;
  }

  export enum ExtensionMode {
    /**
     * The extension is installed normally (for example, from the marketplace
     * or VSIX) in VS Code.
     */
    Production = 1,

    /**
     * The extension is running from an `--extensionDevelopmentPath` provided
     * when launching VS Code.
     */
    Development = 2,

    /**
     * The extension is running from an `--extensionTestsPath` and
     * the extension host is running unit tests.
     */
    Test = 3
  }

  export interface ExtensionContext {
    /**
     * An array to which disposables can be added. When this
     * extension is deactivated the disposables will be disposed.
     */
    readonly subscriptions: Array<{ dispose(): any }>;

    /**
     * A memento object that stores state in the context
     * of the currently opened [workspace](#workspace.workspaceFolders).
     */
    readonly workspaceState: any;

    /**
     * A memento object that stores state independent
     * of the current opened [workspace](#workspace.workspaceFolders).
     */
    readonly globalState: any;

    /**
     * The mode the extension is running in. This is specific to the current
     * extension. One extension may be in `ExtensionMode.Development` while
     * other extensions in the host run in `ExtensionMode.Release`.
     */
    readonly extensionMode: ExtensionMode;
  }
}
