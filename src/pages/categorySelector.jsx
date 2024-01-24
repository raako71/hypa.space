import { useState, useEffect } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

const CategorySelector = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error('No user is currently signed in');
        // Handle the case when no user is signed in
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch('https://us-central1-hypa-space.cloudfunctions.net/getCategories', {
        headers: {
          'Authorization': `Bearer ${idToken}` // Include the user's ID token in the Authorization header
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch categories');
        // Handle the failure, e.g., show an error message
        return;
      }

      const data = await response.json();

      // Ensure that data is an object and has a categories property
      if (typeof data === 'object' && data.categories) {
        setCategories(data.categories);
      } else {
        console.error('Categories data is not in the expected format:', data);
        // Handle the case when the data is not in the expected format
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Handle the error, e.g., show an error message
    }
  };

  useEffect(() => {
    // Fetch categories when the component mounts
    

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCategories();
      } else {
        // Perform any actions on user logout
        console.log('User is logged out');
      }
    });

    // Cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);

    // If a category is selected, set the subcategories for that category
    if (category) {
      setSubcategories(Object.keys(categories[category]));
      setSelectedSubcategory(null);
    } else {
      setSubcategories([]);
    }
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
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

export default CategorySelector;
