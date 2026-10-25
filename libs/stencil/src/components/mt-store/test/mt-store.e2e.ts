import { newE2EPage } from '@stencil/core/testing';

describe('mt-store', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mt-store></mt-store>');

    const element = await page.find('mt-store');
    expect(element).toHaveClass('hydrated');
  });
});
