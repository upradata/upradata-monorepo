import { anySubdomainRegex, origin } from '../../src/common';
import { checkEmailArgs } from '../../src/email/common';
import { findFile } from '../../src/find-files';
import { makeFirewallMiddleware } from '../../src/middleware/firewall.middleware';

describe('express public API', () => {
    it('exports the server, middleware, email, and file helpers', () => {
        expect(findFile).toBeTypeOf('function');
        expect(makeFirewallMiddleware).toBeTypeOf('function');
        expect(origin).toBeTypeOf('function');
        expect(checkEmailArgs).toBeTypeOf('function');
    });

    it('builds origins that match a base domain and its subdomains', () => {
        const allowed = origin('example.test');
        expect(allowed).toBeInstanceOf(RegExp);
        expect((allowed as RegExp).test('https://example.test')).toBe(true);
        expect(anySubdomainRegex('example\\.test').test('https://api.example.test')).toBe(true);
    });

    it('validates email options and rejects an unlisted referrer', () => {
        expect(
            checkEmailArgs({ from: 'sender@example.test', to: 'person@example.test', text: 'Hello' } as any),
        ).toBeUndefined();
        const req = {
            get: (name: string) => (name === 'referer' ? 'https://invalid.test' : 'localhost'),
            protocol: 'http',
            hostname: 'localhost',
            originalUrl: '/',
        } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
        const next = vi.fn();
        makeFirewallMiddleware(['example.test'])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
import { describe, expect, it, vi } from 'vite-plus/test';
