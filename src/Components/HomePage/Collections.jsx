const Collections = () => {

     const collections = [
    { name: "Jackets", image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1739951338_6120268.jpg?w=480&dpr=1.0" },
    { name: "T-shirts", image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1755880153_8401247.jpg?w=480&dpr=1.0" },
    { name: "Jeans", image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1756484433_1539494.jpg?w=480&dpr=1.0" },

  ];
    return (
        <section className="collections-section section-container">
            <h2 className="section-heading">Shop Our Collections</h2>
            <div className="collections-grid">
                {collections.map((collection, index) => (
                    <div key={index} className="collection-card">
                        <img src={collection.image} alt={collection.name} className="collection-image" />
                        <div className="collection-overlay">
                            <h3 className="collection-title">{collection.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Collections;