import { describe, expect, it, vi } from 'vite-plus/test';

import * as email from '../../src';
import { checkEmailOptions } from '../../src/check-email-options';
import { datasToMailgunDatas } from '../../src/providers/mailgun.send';
import { splitNameEmail, sendEmail } from '../../src/send-email';

describe('email public API', () => {
    it('exports the public email modules', () => {
        expect(email).toHaveProperty('checkEmailOptions', checkEmailOptions);
        expect(email).toHaveProperty('sendEmail', sendEmail);
        expect(email).toHaveProperty('splitNameEmail', splitNameEmail);
        expect(email).toHaveProperty('datasToMailgunDatas', datasToMailgunDatas);
        expect(email).toHaveProperty('createSendgridSendService');
        expect(email).toHaveProperty('createMailchimpApiService');
        expect(email).toHaveProperty('createMandrillApiService');
    });

    it('validates required addresses and message content', () => {
        expect(
            checkEmailOptions({ from: 'sender@example.test', to: 'person@example.test', text: 'Hello', html: '' }),
        ).toBeUndefined();
        expect(
            checkEmailOptions({ from: 'bad-address', to: 'person@example.test', text: 'Hello', html: '' }),
        ).toBeInstanceOf(Error);
        expect(
            checkEmailOptions({ from: 'sender@example.test', to: 'person@example.test', text: 'Hello' } as any),
        ).toBeInstanceOf(Error);
    });

    it('splits a display name from an email address', () => {
        expect(splitNameEmail('Sender Name <sender@example.test>')).toEqual({
            name: 'Sender Name',
            email: 'sender@example.test',
        });
        expect(splitNameEmail('sender@example.test')).toEqual({ name: '', email: 'sender@example.test' });
    });

    it('sends through an injected provider without contacting a service', async () => {
        const send = vi.fn(async (_data: unknown) => [
            {
                type: 'success' as const,
                id: 'local',
                status: 'sent',
                message: 'ok',
                to: 'person@example.test',
                hasSendBeenRequested: true,
            },
        ]);
        const result = await sendEmail(
            { providerName: 'mailgun', provider: { send, isMarketing: false } as any },
            {
                from: 'sender@example.test',
                to: 'person@example.test',
                subject: 'Hello',
                text: 'Hello',
                html: '<p> Hi </p>',
            },
        );
        expect(send).toHaveBeenCalledOnce();
        expect(send.mock.calls[0][0]).toMatchObject({ html: '<p>Hi</p>', subject: 'Hello' });
        expect(result).toMatchObject({ isMarketing: false, result: [{ type: 'success' }] });
    });
});
