import ProductGrid from "./ProductGrid";
const NewArrivals = ({ products , handleAddToCart}) => (
    <section className="best-sellers-section section-container">
        <h2 className="section-heading">New Arrivals</h2>
        <ProductGrid products={products} handleAddToCart={handleAddToCart} />
    </section>
);

export default NewArrivals;