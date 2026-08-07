import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, selectedSizes = [] }) => (
  <div className="product-grid-container" style={{ minHeight: "350px" }}>
    <div className="
    product-grid
    grid
    gap-4
    grid-cols-2        /* small devices */
    sm:grid-cols-2     /* small screen */
    md:grid-cols-4     /* tablet */
    lg:grid-cols-3     /* desktop */
    ">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id || `product-${index}`} 
          product={product}
          selectedSizes={selectedSizes}
        />
      ))}
    </div>
  </div>
);

export default ProductGrid;