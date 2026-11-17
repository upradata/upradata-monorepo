import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { MailgunClientOptions as MailgunOptions } from 'mailgun.js/definitions';

export type MailgunClientOptions = Omit<MailgunOptions, 'key'> & { apiKey: string };

export const mailgunApi = (options: MailgunClientOptions): ReturnType<Mailgun['client']> => {
    const { apiKey, ...mailgunOptions } = options;

    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({ ...mailgunOptions, key: apiKey });

    return mg;
};
