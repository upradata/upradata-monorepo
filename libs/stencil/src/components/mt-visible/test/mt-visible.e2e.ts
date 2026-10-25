import { newE2EPage } from '@stencil/core/testing';

describe('mt-visible', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mt-visible></mt-visible>');

    const element = await page.find('mt-visible');
    expect(element).toHaveClass('hydrated');
  });
});
