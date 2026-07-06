import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from "./Components/HomePage/HomePage";
import OrdersPage from "./Components/OrdersPage/OrderPage";
import MenPage from "./Components/MenPage/MenPage";
import WoMenPage from "./Components/WoMenPage/WoMenPage";
import CustomizationPage from "./Components/CustomizationPage/CustomizationPage";
import ContactPage from "./Components/ContactPage/ContactPage";
import CategoryPage from "./Components/CategoryPage/CategoryPage";
import CheckoutPage from "./Components/CheckoutPage/CheckoutPage";
import Header from "./Components//Header/Header";
import Footer from "./Components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import PrivacyPage from "./Components/PrivacyPage/PrivacyPage";
import TermsPage from "./Components/TermsPage/TermsPage";
import AboutPage from "./Components/AboutPage/AboutPage";
import FaqPage from "./Components/FaqPage/FaqPage";
import Auth from "./Components/LoginPage/LoginPage";
import LoginPage from "./Components/LoginPage/LoginPage";
import SignupPage from "./Components/SignupPage/SignupPage";
import ProductPage from "./Components/ProductPage/ProductPage";
import WishlistProvider from "./context/WishlistContext";
import WishlistPage from "./Components/WishlistPage/WishlistPage";
import ProfilePage from "./Components/ProfilePage/ProfilePage";
import BestSellerPage from "./Components/BestSellerPage/BestSellerPage";
import WhatsNewPage from "./Components/WhatsNewPage/WhatsNewPage";
import FeaturedProductPage from "./Components/FeaturedProductPage/FeaturedProductPage";
import AllProductsPage from "./Components/AllProductsPage/AllProductsPage";
import SearchResultsPage from "./Components/SearchPage/SearchPage";






function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Header />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{ zIndex: 10001 }}
            toastStyle={{
              zIndex: 10001,
              position: 'relative'
            }}
          />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              {/* <Route path="/men" element={<MenPage />} />
              <Route path="/women" element={<WoMenPage />} /> */}
              <Route path="/customization" element={<CustomizationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/category/:category?" element={<CategoryPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faqs" element={<FaqPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<SignupPage />} />
              <Route
                path="/product/:name"
                element={<ProductPage />}
              />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/best-sellers" element={<BestSellerPage />} />
              <Route path="/whats-new" element={<WhatsNewPage />} />
              <Route path="/featured-products" element={<FeaturedProductPage />} />
              <Route path="/all-products" element={<AllProductsPage />} />
              <Route path="/search" element={<SearchResultsPage />} />




            </Routes>
          </main>
          <Footer />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
