import { notFound } from 'next/navigation';
import CmsPageRenderer from '@/components/storefront/CmsPageRenderer';
import { getServerApiUrl } from '@/utils/serverApi';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCmsPage(slug) {
  try {
    const response = await fetch(`${getServerApiUrl()}/cms/pages/${slug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.page || null;
  } catch {
    return null;
  }
}

export default async function CmsDynamicPage({ params }) {
  const page = await getCmsPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <CmsPageRenderer blocks={page.blocks || []} />
    </>
  );
}
