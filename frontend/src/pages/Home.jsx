import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store/productSlice";
import { addItem } from "../store/cartSlice";
import { Link } from "react-router-dom";

import Hero from "../components/Hero";
import Carousel from "../components/Carousel";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import CategoryCards from "../components/CategoryCards";

export default function Home() {
  const dispatch = useDispatch();
  const { products = [] } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const latestProducts = products?.slice(0, 6);

  return (
    <div className="bg-base-200 min-h-screen">
      <Hero />
      <Carousel />
      
      <CategoryCards />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-base-content">
          Latest Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {latestProducts.length == 0 ? (
            <p className="text-center text-base-content/60">
              No products found
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestProducts?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={() => dispatch(addItem(product))}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link to="/marketplace" className="btn btn-primary px-8">
            View More Products
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
