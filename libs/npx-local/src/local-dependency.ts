import { InstallMode } from './local-install.options';
import { DependencyName } from './types';

export interface DependencyDetail {
    path: string;
    installDir: string; // where to install (default node_modules)
}

export type Dependency = DependencyDetail | string;
export type DependencyOptions = (Pick<DependencyDetail, 'path'> & Partial<Omit<DependencyDetail, 'path'>>) | string;

export interface LocalDependencyOptions {
    version?: string;
    mode?: InstallMode;
    dependencyName?: DependencyName;
}

export class LocalDependency {
    public dependencyDetail!: DependencyDetail;
    public version!: string;
    public mode!: InstallMode;
    public installDir!: string;
    public sourcePath!: string;
    public dependencyName: DependencyName;

    constructor(dependency: Dependency, options?: LocalDependencyOptions) {
        this.parseDependency(dependency, options);
        this.dependencyName = options?.dependencyName || 'dependencies';
    }

    private parseDependency(dependency: DependencyOptions, options: LocalDependencyOptions = {}) {
        const dep: DependencyDetail = Object.assign(
            { installDir: 'node_modules' },
            typeof dependency === 'string' ? { path: dependency } : dependency,
        );

        this.dependencyDetail = dep;
        const [path, depVersion] = dep.path.split('@');

        const split = () => {
            if (path.split(':').length === 2) {
                const [mode, sourcePath] = path.split(':') as [InstallMode, string];
                return { mode, sourcePath };
            }

            return { mode: undefined, sourcePath: path };
        };

        const { mode, sourcePath } = split();

        this.version = options.version || depVersion;
        this.sourcePath = sourcePath;
        this.mode = options.mode || mode || 'link';
        this.installDir = dep.installDir;
    }

    public unparse(): Dependency {
        const path = `${this.mode}:${this.sourcePath}@${this.version}`;

        if (this.installDir === 'node_modules') return path;

        return {
            path,
            installDir: this.installDir,
        };
    }
}
