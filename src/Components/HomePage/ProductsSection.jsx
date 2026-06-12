import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";

const ProductsSection = ({ title, products, link, handleAddToCart}) => (
    <section className="products-section">
        <div className="best-sellers-section section-container">
            <h2 className="section-heading">{title}</h2>
            <ProductGrid products={products} handleAddToCart={handleAddToCart} />

            <div>
                <Link
                to={link}
                className="show-more-button"
                >
                    Show More
                </Link>
            </div>
        </div>
    </section>
);

export default ProductsSection;