import {
  createEditorBlock,
  getDefaultBlockProps,
  normalizeEditorBlock,
  normalizeEditorBlockTree,
  normalizeEditorWidgetMap,
} from '@/components/editor/sharedEditorContract';

describe('sharedEditorContract', () => {
  it('returns isolated default props objects', () => {
    const first = getDefaultBlockProps('tabs');
    const second = getDefaultBlockProps('tabs');

    first.items[0].label = 'Changed';

    expect(second.items[0].label).toBe('Tab 1');
  });

  it('creates blocks with merged defaults and custom props', () => {
    const block = createEditorBlock({
      type: 'button',
      idPrefix: 'block',
      props: { text: 'Checkout' },
    });

    expect(block.id).toMatch(/^block-/);
    expect(block.type).toBe('button');
    expect(block.zone).toBe('after');
    expect(block.props).toMatchObject({
      text: 'Checkout',
      link: '/products',
      className: 'btn btn-primary',
    });
  });

  it('normalizes legacy blocks with defaults and children', () => {
    const normalized = normalizeEditorBlock(
      {
        type: 'accordion',
        props: { items: [{ title: 'FAQ', content: 'Answer' }] },
        children: [{ type: 'text', props: { text: 'Nested' } }],
      },
      { idPrefix: 'legacy' },
    );

    expect(normalized.id).toMatch(/^legacy-/);
    expect(normalized.zone).toBe('after');
    expect(normalized.props.items).toHaveLength(1);
    expect(normalized.children).toHaveLength(1);
    expect(normalized.children[0].type).toBe('text');
    expect(normalized.children[0].id).toMatch(/^legacy-/);
  });

  it('normalizes block trees and drops invalid entries', () => {
    const tree = normalizeEditorBlockTree([
      null,
      { type: 'text', props: { text: 'Hello' } },
      undefined,
      { type: 'row', children: [{ type: 'column' }] },
    ]);

    expect(tree).toHaveLength(2);
    expect(tree[0].type).toBe('text');
    expect(tree[1].type).toBe('row');
    expect(tree[1].children[0].type).toBe('column');
  });

  it('normalizes widget maps and ignores invalid values', () => {
    const map = normalizeEditorWidgetMap({
      promo: { type: 'button', props: { text: 'Shop' } },
      bad: null,
      legacy: { props: { text: 'Legacy text' } },
    });

    expect(Object.keys(map)).toEqual(['promo', 'legacy']);
    expect(map.promo.id).toBe('promo');
    expect(map.promo.type).toBe('button');
    expect(map.legacy.type).toBe('text');
    expect(map.legacy.props.text).toBe('Legacy text');
  });

  it('falls back to safe type and zone when invalid values are provided', () => {
    const normalized = normalizeEditorBlock({
      id: 'unsafe',
      type: 'unknown-widget',
      zone: 'middle',
      props: 'invalid-props',
    });

    expect(normalized.type).toBe('text');
    expect(normalized.zone).toBe('after');
    expect(normalized.props).toMatchObject({ text: 'Text block' });
  });

  it('normalizes creation options with invalid fields', () => {
    const block = createEditorBlock({
      type: 'not-real',
      zone: 'inside',
      props: ['bad'],
      idPrefix: 'bad prefix !!',
    });

    expect(block.id).toMatch(/^badprefix-/);
    expect(block.type).toBe('text');
    expect(block.zone).toBe('after');
    expect(block.props).toMatchObject({ text: 'Text block' });
  });

  it('ignores empty widget keys during map normalization', () => {
    const map = normalizeEditorWidgetMap({
      '': { type: 'text', props: { text: 'Bad key' } },
      good: { type: 'heading', props: { text: 'Good key' } },
    });

    expect(Object.keys(map)).toEqual(['good']);
    expect(map.good.type).toBe('heading');
  });
});
