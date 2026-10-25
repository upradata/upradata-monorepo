import { newSpecPage } from '@stencil/core/testing';
import { MtVisible } from '../mt-visible';

describe('mt-visible', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MtVisible],
      html: `<mt-visible></mt-visible>`,
    });
    expect(page.root).toEqualHtml(`
      <mt-visible>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mt-visible>
    `);
  });
});
