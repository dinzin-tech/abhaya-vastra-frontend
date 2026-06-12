import ProductGrid from "./ProductGrid";
const BestSellers = ({ products , handleAddToCart}) => (
    <section className="best-sellers-section section-container">
        <h2 className="section-heading">Best Sellers</h2>
        <ProductGrid products={products} handleAddToCart={handleAddToCart} />
    </section>
);

export default BestSellers;




