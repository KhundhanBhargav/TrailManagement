import { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const toNumber = (value) => Number(value) || 0;

  const [package_, setPackage] = useState({
    eventType: null,
    functionHall: null,
    decorations: [],
    food: [],
    services: [],
    eventDate: null,
    guestCount: 0,
    totalAmount: 0,
    advanceAmount: 0,
  });

  const [cart, setCart] = useState({
    halls: [],
    decorations: [],
    food: [],
    services: [],
  });

  const addHallToPackage = (hall) => {
    const price = toNumber(hall.price);
    setPackage((prev) => ({
      ...prev,
      functionHall: hall,
      totalAmount: prev.totalAmount + price,
    }));
  };

  const addDecorationToPackage = (decoration) => {
    const amount = toNumber(decoration.amount);
    setPackage((prev) => ({
      ...prev,
      decorations: [...prev.decorations, decoration],
      totalAmount: prev.totalAmount + amount,
    }));
  };

  const addFoodToPackage = (food) => {
    const price = toNumber(food.price);
    setPackage((prev) => ({
      ...prev,
      food: [...prev.food, food],
      totalAmount: prev.totalAmount + price,
    }));
  };

  const addServiceToPackage = (service) => {
    const price = toNumber(service.price);
    setPackage((prev) => ({
      ...prev,
      services: [...prev.services, service],
      totalAmount: prev.totalAmount + price,
    }));
  };

  const removeFromPackage = (type, id) => {
    setPackage((prev) => {
      const items = prev[type].filter((item) => item.id !== id);
      const item = prev[type].find((item) => item.id === id);
      
      // For food items, base price is removed (guest count multiplication handled in summary)
      const priceToRemove = toNumber(item?.price || item?.amount || 0);
      
      const newAmount = prev.totalAmount - priceToRemove;

      return {
        ...prev,
        [type]: items,
        totalAmount: Math.max(0, newAmount),
      };
    });
  };

  const updatePackageDate = (date) => {
    setPackage((prev) => ({
      ...prev,
      eventDate: date,
    }));
  };

  const updateGuestCount = (count) => {
    setPackage((prev) => ({
      ...prev,
      guestCount: count,
    }));
  };

  const calculateAdvanceAmount = () => {
    const advance = Math.ceil(package_.totalAmount * 0.5);
    setPackage((prev) => ({
      ...prev,
      advanceAmount: advance,
    }));
  };

  const clearPackage = () => {
    setPackage({
      eventType: null,
      functionHall: null,
      decorations: [],
      food: [],
      services: [],
      eventDate: null,
      guestCount: 0,
      totalAmount: 0,
      advanceAmount: 0,
    });
  };

  return (
    <BookingContext.Provider
      value={{
        package: package_,
        cart,
        addHallToPackage,
        addDecorationToPackage,
        addFoodToPackage,
        addServiceToPackage,
        removeFromPackage,
        updatePackageDate,
        updateGuestCount,
        calculateAdvanceAmount,
        clearPackage,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
