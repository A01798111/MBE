import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Inicializar estado del carrito desde localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('bme_cart') || localStorage.getItem('novastore_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  // Guardar en localStorage cuando cambie el carrito
  useEffect(() => {
    try {
      localStorage.setItem('bme_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error guardando en localStorage', e);
    }
  }, [cart]);

  // Mostrar mensaje toast
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Añadir producto al carrito
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock || 99)
        };
        return updated;
      } else {
        return [...prevCart, { ...product, quantity: Math.min(quantity, product.stock || 99) }];
      }
    });

    showToast(`"${product.name}" añadido al carrito`);
  };

  // Modificar cantidad específica
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity: Math.min(newQuantity, item.stock || 99) };
        }
        return item;
      })
    );
  };

  // Eliminar producto
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
  };

  // Flujo de Checkout
  const openCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = (returnToCart = false) => {
    setIsCheckoutOpen(false);
    if (returnToCart) {
      setIsCartOpen(true);
    }
  };

  // Confirmar pedido de prueba: genera folio, guarda detalles, vacía carrito y abre confirmación
  const createTestOrder = (customerData, paymentMethod) => {
    const orderFolio = `MBE-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderData = {
      folio: orderFolio,
      date: new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customer: customerData,
      paymentMethod,
      items: [...cart],
      subtotal,
      shipping,
      total,
      isTestOrder: true
    };

    setConfirmedOrder(orderData);
    setIsCheckoutOpen(false);
    clearCart();
    return orderData;
  };

  const closeOrderConfirmation = () => {
    setConfirmedOrder(null);
  };

  // Cálculos derivados en Pesos Mexicanos (MXN)
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Envío gratis a partir de $1,500 MXN, de lo contrario $150 MXN
  const shipping = subtotal >= 1500 || subtotal === 0 ? 0 : 150;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openCheckout,
        closeCheckout,
        confirmedOrder,
        createTestOrder,
        closeOrderConfirmation,
        totalItems,
        subtotal,
        shipping,
        total,
        toast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
