import ProductCard from './ProductCard';

const ProductGrid = ({ products, selectedSizes = [] }) => (
  <div className="product-grid-container">
    <div className="
    product-grid
    grid
    gap-4
    grid-cols-2        /* very small devices */
    sm:grid-cols-2     /* small screen */
    md:grid-cols-4     /* mobile/tablet: 4 items per row */
    lg:grid-cols-3     /* desktop/laptop: 3 items per row */
    ">
      {products.map((product, index) => (
        <ProductCard 
          key={index} 
          product={product}
          selectedSizes={selectedSizes}
        />
      ))}
    </div>
  </div>
);

export default ProductGrid;