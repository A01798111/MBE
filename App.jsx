import React, { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { OurStory } from './components/OurStory';
import { SocialImpact } from './components/SocialImpact';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import productsData from './data/products.json';
import { Check } from 'lucide-react';

function StoreApp() {
  const [products] = useState(productsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { toast } = useCart();

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todos');
    setSortBy('featured');
  };

  return (
    <div className="bme-app">
      {/* 1. Encabezado elegante en tono crema con logotipo BME */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 2. Banner principal con fotografía realista y botón a catálogo */}
      <Hero />

      {/* 3. Catálogo de productos con tarjetas pequeñas horizontales */}
      <main>
        <ProductGrid
          products={products}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* 4. Sección Nuestra Historia */}
        <OurStory />

        {/* 5. Sección Impacto Social */}
        <SocialImpact />
      </main>

      {/* Modal de Detalle de Producto */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Bolsa / Carrito de Compras lateral */}
      <CartDrawer />

      {/* Notificación Toast artesanal */}
      {toast && (
        <div className="bme-toast-container">
          <div className="bme-toast">
            <Check size={17} className="bme-toast-icon" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* 6. Pie de página en azul marino */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <StoreApp />
    </CartProvider>
  );
}
