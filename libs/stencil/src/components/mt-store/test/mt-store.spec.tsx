import { newSpecPage } from '@stencil/core/testing';
import { MtStore } from '../mt-store';

describe('mt-store', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MtStore],
      html: `<mt-store></mt-store>`,
    });
    expect(page.root).toEqualHtml(`
      <mt-store>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mt-store>
    `);
  });
});
