export default function ProductSchema({ product }) {
    if (!product) return null;

    const productUrl = `https://weBazaar.in/products/${product.slug}`;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images?.map((img) => img.url || img) || [],
        sku: product.sku || product._id,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'weBazaar',
        },
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'INR',
            price: product.price,
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
                '@type': 'Organization',
                name: 'weBazaar',
            },
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
