
declare module 'gulp-exec' {
    export interface ExecOptions {
        env?: NodeJS.ProcessEnv;
        pipeStdout?: boolean;
        continueOnError?: boolean;
    }

    export interface ExecReporter {
        err?: boolean;
        stderr?: boolean;
        stdout?: boolean;
    }

    export interface GulpExec {
        (command: string, options: ExecOptions): NodeJS.ReadWriteStream;
        reporter: (options: ExecReporter) => NodeJS.ReadWriteStream;
    }

    const gulpExec: GulpExec;
    export default gulpExec;
}
