import { AppInjector } from '@upradata/dependency-injection';
import { keys } from '@upradata/util';

import { DependencyName, DependencyType } from './types';

export const INSTALL_MODES = ['link', 'copy'] as const;
export type InstallMode = (typeof INSTALL_MODES)[number];

export const isInstallMode = (mode: string | undefined | null): mode is InstallMode => {
    return !!mode && keys(INSTALL_MODES).includes(mode as any);
};

export interface LocalPackage {
    path: string;
    mode: InstallMode;
}

export class LocalInstallOptions<LocalDep extends string | LocalPackage = string | LocalPackage> {
    dependencyType?: DependencyType = 'prod';
    localPackages?: LocalDep[] = [];
    projectDir?: string = process.cwd(); // which project where we want to install the local packages
    installDir?: string = 'node_modules'; // dir where all the local packages will be copied
    findUp?: boolean = false;
    verbose?: number = 0;
    quiet?: boolean = false;
    // force: boolean = false;
    mode?: InstallMode = 'link';
    watch?: boolean = false;
    npmPropertyToCopyLocalDeps?: DependencyName = 'dependencies';
}

export const getOptions = (): LocalInstallOptions => AppInjector.root.get(LocalInstallOptions);
