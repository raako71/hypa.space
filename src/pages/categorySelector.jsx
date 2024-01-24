import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

const CategorySelector = ({ setSelectedCategory, setSelectedSubcategory }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategoryLocal] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategoryLocal] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error('No user is currently signed in');
          return;
        }

        const idToken = await user.getIdToken();

        const response = await fetch('https://us-central1-hypa-space.cloudfunctions.net/getCategories', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (!response.ok) {
          console.error('Failed to fetch categories');
          return;
        }

        const data = await response.json();

        if (typeof data === 'object' && data.categories) {
          setCategories(data.categories);
        } else {
          console.error('Categories data is not in the expected format:', data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    // Fetch categories when the component mounts
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCategories();
      } else {
        console.log('User is logged out');
      }
    });

    // Cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Call the setSelectedCategory callback if provided
    if (setSelectedCategory) {
      setSelectedCategory(selectedCategory);
    }
  }, [selectedCategory, setSelectedCategory]);

  useEffect(() => {
    // Call the setSelectedSubcategory callback if provided
    if (setSelectedSubcategory) {
      setSelectedSubcategory(selectedSubcategory);
    }
  }, [selectedSubcategory, setSelectedSubcategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategoryLocal(category);

    if (category) {
      setSubcategories(Object.keys(categories[category]));
      setSelectedSubcategoryLocal(null);
    } else {
      setSubcategories([]);
    }
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategoryLocal(subcategory);
  };

  return (
    <div>
      <div style={{ margin: "8px" }}>
        <label>Select Category: </label>
        <select onChange={(e) => handleCategorySelect(e.target.value)}>
          <option value="">Choose a Category</option>
          {Object.keys(categories).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      {selectedCategory && (
        <div style={{ margin: "8px" }}>
          <label>Select Subcategory: </label>
          <select onChange={(e) => handleSubcategorySelect(e.target.value)}>
            <option value="">Choose a Subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

CategorySelector.propTypes = {
  setSelectedCategory: PropTypes.func,
  setSelectedSubcategory: PropTypes.func,
};

export default CategorySelector;
