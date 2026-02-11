export default function ProductSchema({ product }) {
    if (!product) return null;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images?.map((img) => img.url || img) || [],
        sku: product.sku || product._id,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'Radeo',
        },
        offers: {
            '@type': 'Offer',
            url: typeof window !== 'undefined' ? window.location.href : '',
            priceCurrency: 'INR',
            price: product.price,
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
        },
    };

    if (product.averageRating) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.numReviews,
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
