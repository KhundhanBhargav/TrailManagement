import { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import api from '../../api/config';
import { FOOD_ENDPOINTS } from '../../api/endpoints';
import '../../styles/tabs.css';

export const FoodTab = ({ eventId }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFoods, setSelectedFoods] = useState(new Set());
  const { addFoodToPackage } = useBooking();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await api.get(FOOD_ENDPOINTS.LIST);
        setFoodItems(response.data);
      } catch (err) {
        console.error('Failed to fetch food items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  const handleSelectFood = (food) => {
    const newSelected = new Set(selectedFoods);
    if (newSelected.has(food.id)) {
      newSelected.delete(food.id);
    } else {
      newSelected.add(food.id);
      addFoodToPackage(food);
    }
    setSelectedFoods(newSelected);
  };

  if (loading) return <div className="loading">Loading food items...</div>;

  // Group food by type (Veg/Non-Veg)
  const vegItems = foodItems.filter((f) => f.food_type === 'veg');
  const nonVegItems = foodItems.filter((f) => f.food_type === 'non_veg');

  if (foodItems.length === 0) {
    return (
      <div className="tab-content-wrapper">
        <h3>Food Menu</h3>
        <p className="no-items">No food items available for this event</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <h3>Food Menu</h3>

      {vegItems.length > 0 && (
        <div className="food-section">
          <h4>🥗 Vegetarian</h4>
          <div className="items-grid">
            {vegItems.map((food) => (
              <div
                key={food.id}
                className={`item-card ${selectedFoods.has(food.id) ? 'selected' : ''}`}
              >
                <img
                  src={food.image || 'https://via.placeholder.com/250x150'}
                  alt={food.name}
                />
                <div className="item-info">
                  <h4>{food.name}</h4>
                  <p className="description">{food.description}</p>
                  <div className="item-footer">
                    <span className="price">₹{food.price.toLocaleString()} per plate</span>
                    <button
                      onClick={() => handleSelectFood(food)}
                      className={`add-btn ${selectedFoods.has(food.id) ? 'selected' : ''}`}
                    >
                      {selectedFoods.has(food.id) ? '✓ Added' : 'Add to Package'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nonVegItems.length > 0 && (
        <div className="food-section">
          <h4>🍗 Non-Vegetarian</h4>
          <div className="items-grid">
            {nonVegItems.map((food) => (
              <div
                key={food.id}
                className={`item-card ${selectedFoods.has(food.id) ? 'selected' : ''}`}
              >
                <img
                  src={food.image || 'https://via.placeholder.com/250x150'}
                  alt={food.name}
                />
                <div className="item-info">
                  <h4>{food.name}</h4>
                  <p className="description">{food.description}</p>
                  <div className="item-footer">
                    <span className="price">₹{food.price.toLocaleString()} per plate</span>
                    <button
                      onClick={() => handleSelectFood(food)}
                      className={`add-btn ${selectedFoods.has(food.id) ? 'selected' : ''}`}
                    >
                      {selectedFoods.has(food.id) ? '✓ Added' : 'Add to Package'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
