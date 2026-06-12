import React, { useState } from "react";
import { Link } from "react-router-dom";

const CustomizedProducts = [
  
  {
    title: "Women’s Activewear",
    image:
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTv9ZARgjQ1NmfXxHIYJMGCAtfh8yeXJ6fSA5STlWQeK-L5i1xrBlcG_36D5TwPRmMOt3oJlL1PC6F0Bl8pnhLZE9xFEzjCRXuurkva2BF5mpUsxV_vfZMDBg",
    hoverImage: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc',
    customizable : true
  },
  {
    title: "Western Wear",
    image:
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQO-RueX0_6B7yNr4Kw_RM1IyYLoyfGziBAf6TaEUWrNRcP-ckRfeG4b51aP_G69VggB4KDkxSKdio1ey_TExevZdcUS-YblOdFVwUQ4XT4vRTdFdJt1E7S",
    hoverImage: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc',
    customizable : true
  },
  {
    title: "Sportswear",
    image:
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTmYTkNnVjMUUjWIhFmf1V0tktBWcWv2FbJ5xN1rch5-cGocIpuOQYtBlA-5-kgmeGEGuXBZj8oGjgNQEbfbYiqygesn_M33gjilE1p6HF68ffvvnJQD_uWHw",
    hoverImage: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc',
    customizable : true
  },
  {
    title: "Loungewear",
    image:
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTvyI0tZV89eHLNC-_bZCZtpjqIEgGJiXokfAYoRnsU4RhP0SEzp57w_Jui9Pnr_0M3n4k_GL7vBJ_czk9bxZD46UEOCBO4O-lOaDzxrXpXle9LDjoG83PI",
    hoverImage: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc',
    customizable : true
  },
  {
    title: "Innerwear",
    image:
      "https://www.technosport.in/cdn/shop/files/P798IronGrey_1.jpg?v=1738840962&width=1946",
    hoverImage: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc',
    customizable : true
  },
  {
    title: "Lingerie",
    image:
      "https://cdn.shopify.com/s/files/1/0266/6276/4597/files/bra_panty_set_d5d7d11a-9684-4a5b-873f-bc89058ef2e3.jpg?v=1679471630",
     hoverImage: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc',
     customizable : true
  },
  {
    title: "Shorts",
    image:
      "https://claura.in/cdn/shop/products/Shorts-19-brown-6.jpg?v=1702710320&width=1080",
     hoverImage: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc',
     customizable : true,
    
  },
  {
    title: "Trousers",
    image:
      "https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/30063124/2024/6/28/af6c493c-30ec-450e-b588-e565911532a81719562420746TheRoadsterLifestyleCoLinenRelaxed-FitRegularTrousers1.jpg",
    hoverImage: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc',
    customizable : true
  },

];

export default function CustomizedProduct() {
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <>
      <section className="shop-section">
        <h2 className="shop-title">Customized Products</h2>
        <div className="shop-grid">
          {CustomizedProducts.map((product, index) => (
            <div
              className="shop-card"
              key={index}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <img
                src={product.image}
                alt={product.title}
                className="product-img default-img"
              />
              <img
                src={product.hoverImage}
                alt={`Hover for ${product.title}`}
                className="product-img hover-img"
              />
              <div className="contact-btn-container">
                <Link to= {`/product/${encodeURIComponent(product.title)}`}  className="contact-us-btn">Read More</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
