import { describe, expect, it } from 'vite-plus/test';

import * as nodeUtil from '../../src';
import * as cache from '../../src/cache';
import * as csv from '../../src/csv';
import * as files from '../../src/files';
import * as findUp from '../../src/find-up';
import * as fsUtil from '../../src/fs';
import * as json from '../../src/json';
import * as logNice from '../../src/log-nice';
import * as pathNormalize from '../../src/path-normalize';
import * as programArgs from '../../src/program-args';
import * as requireUtil from '../../src/require';
import * as stats from '../../src/stats';
import * as templateStyle from '../../src/template-style';
import * as terminal from '../../src/terminal';
import * as tmpfile from '../../src/tmpfile';
import * as tsUtil from '../../src/ts';
import * as useful from '../../src/useful';

describe('node-util public API', () => {
    it('loads every declared public subpath', () => {
        expect([
            cache,
            csv,
            files,
            findUp,
            fsUtil,
            json,
            logNice,
            pathNormalize,
            programArgs,
            requireUtil,
            stats,
            templateStyle,
            terminal,
            tmpfile,
            tsUtil,
            useful,
        ]).toHaveLength(16);
        expect(nodeUtil).toHaveProperty('execAsync');
        expect(nodeUtil).toHaveProperty('forEachFiles');
        expect(nodeUtil).toHaveProperty('findUp');
        expect(nodeUtil).toHaveProperty('Stats');
    });
});
