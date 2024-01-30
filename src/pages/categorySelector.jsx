import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

const CategorySelector = ({ setSelectedCategory, setSelectedSubcategory }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategoryLocal] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategoryLocal] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const newCategoryInputRef = useRef(null);
  const newSubcategoryInputRef = useRef(null);

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
  
    if (category === '__new_category') {
      // Do something to handle adding a new category
      return; // Exit early to prevent further execution of the function
    }
  
    if (category) {
      // Check if categories is truthy before accessing its properties
      if (categories && categories[category]) {
        setSubcategories(Object.keys(categories[category]));
        setSelectedSubcategoryLocal('');
      } else {
        console.error(`Category "${category}" does not exist in the categories state.`);
      }
    } else {
      setSubcategories([]);
    }
  };
  
  

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategoryLocal(subcategory);
  };

  const handleNewCategorySave = () => {
    if (newCategory.trim() !== '') {
      const updatedCategories = {
        ...categories,
        [newCategory]: {}
      };
      setCategories(updatedCategories);
      setSelectedCategoryLocal(newCategory); // Update selected category to the new one
      setSubcategories(Object.keys(updatedCategories[newCategory]));
      setNewCategory('');
    }
  };

  const handleNewSubcategorySave = () => {
    if (newSubcategory.trim() !== '') {
      const updatedCategories = {
        ...categories,
        [selectedCategory]: {
          ...categories[selectedCategory],
          [newSubcategory]: {}
        }
      };
      setCategories(updatedCategories);
      setSelectedSubcategoryLocal(newSubcategory); // Update selected subcategory to the new one
      setSubcategories(Object.keys(updatedCategories[selectedCategory]));
      setNewSubcategory('');
    }
  };

  return (
    <div>
      <div style={{ margin: "8px" }}>
        <label>Select Category: </label>
        <select value={selectedCategory} onChange={(e) => handleCategorySelect(e.target.value)}>
          <option value="">Choose a Category</option>
          {Object.keys(categories).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value="__new_category">Add New Category</option>
        </select>
        {selectedCategory === '__new_category' && (
          <div style={{ marginTop: "5px" }}>
            <input
              type="text"
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ marginRight: "5px" }}
              ref={newCategoryInputRef}
              autoFocus
            />
            <button onClick={() => {
              handleNewCategorySave();
              if (newCategoryInputRef.current) {
                newCategoryInputRef.current.focus();
              }
            }}>Save</button>
          </div>
        )}
      </div>

      {selectedCategory && (
        <div style={{ margin: "8px" }}>
          <label>Select Subcategory: </label>
          <select value={selectedSubcategory} onChange={(e) => handleSubcategorySelect(e.target.value)}>
            <option value="">Choose a Subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
            <option value="__new_subcategory">Add New Subcategory</option>
          </select>

          {selectedSubcategory === '__new_subcategory' && (
            <div style={{ marginTop: "5px" }}>
              <input
                type="text"
                placeholder="Enter new subcategory"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                style={{ marginRight: "5px" }}
                ref={newSubcategoryInputRef}
                autoFocus
              />
              <button onClick={() => {
                handleNewSubcategorySave();
                if (newSubcategoryInputRef.current) {
                  newSubcategoryInputRef.current.focus();
                }
              }}>Save</button>
            </div>
          )}
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
