'use client';

import Link from 'next/link';
import Image from 'next/image';

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const normalizePageBlocks = (blocks = []) => {
  if (!Array.isArray(blocks)) return [];

  return blocks
    .filter(Boolean)
    .sort((a, b) => Number(a.position || 0) - Number(b.position || 0))
    .map((block) => ({
      type: block.type || block?.config?.type || 'text',
      visibility: block.visibility || 'all',
      props: isObject(block?.config?.props) ? block.config.props : isObject(block.config) ? block.config.props || {} : {},
      children: Array.isArray(block?.config?.children) ? block.config.children : [],
      rawConfig: block.config || {},
      id: block._id || block.id || `block-${Math.random().toString(36).slice(2, 8)}`,
    }));
};

const renderNode = (node, prefix = 'node') => {
  const id = node.id || `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  const type = node.type || node?.rawConfig?.type || 'text';
  const props = node.props || node?.rawConfig?.props || {};
  const children = Array.isArray(node.children) ? node.children : [];
  const className = props.className || '';

  if (type === 'row') {
    const columns = Math.min(Math.max(Number(props.columns) || 2, 1), 6);
    return (
      <div key={id} className={className || 'grid gap-4'} style={className ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {children.map((child, index) => renderNode(child, `${id}-${index}`))}
      </div>
    );
  }

  if (type === 'column' || type === 'container') {
    return (
      <div key={id} className={className || 'space-y-3'}>
        {children.map((child, index) => renderNode(child, `${id}-${index}`))}
      </div>
    );
  }

  if (type === 'heading' || type === 'hero') {
    return <h2 key={id} className={className || 'font-serif text-3xl font-semibold text-primary-900'}>{props.text || props.title || ''}</h2>;
  }

  if (type === 'button' || type === 'cta') {
    const href = props.link || props.href || '/';
    const label = props.text || props.buttonText || 'Learn More';
    return <Link key={id} href={href} className={className || 'btn btn-primary'}>{label}</Link>;
  }

  if (type === 'image' || type === 'gallery') {
    const src = props.src || props.imageUrl || props.url || '';
    if (!src) return null;
    return (
      <Image
        key={id}
        src={src}
        alt={props.alt || ''}
        className={className || 'w-full rounded-lg'}
        width={Number(props.width) || 1200}
        height={Number(props.height) || 800}
        unoptimized
      />
    );
  }

  if (type === 'spacer') {
    return <div key={id} style={{ height: Number(props.height || 24) }} />;
  }

  if (type === 'divider') {
    return <hr key={id} className={className || 'border-primary-200'} />;
  }

  return <p key={id} className={className || 'text-primary-700'}>{props.text || props.content || ''}</p>;
};

export default function CmsPageRenderer({ blocks = [] }) {
  const normalizedBlocks = normalizePageBlocks(blocks);

  if (normalizedBlocks.length === 0) {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <p className="text-primary-600">No content blocks found for this page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom max-w-5xl space-y-5">
        {normalizedBlocks.map((block, index) => renderNode(block, `root-${index}`))}
      </div>
    </section>
  );
}
