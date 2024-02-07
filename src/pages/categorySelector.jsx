import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore/lite';
import { auth, db } from '../firebase-config';

const CategorySelector = ({ setSelectedCategory, setSelectedSubcategory, setSelectedSubSubcategory }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategoryLocal] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedSubcategory, setSelectedSubCategoryLocal] = useState('');
  const [selectedSubSubcategory, setSelectedSubSubCategoryLocal] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const newCategoryInputRef = useRef(null); // Define ref for the new category input

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollectionRef = collection(db, 'categories');
        const querySnapshot = await getDocs(categoriesCollectionRef);
        const categoriesData = {};

        querySnapshot.forEach((doc) => {
          const categoryName = doc.id;
          const categoryData = doc.data();
          categoriesData[categoryName] = categoryData;
        });

        setCategories(categoriesData);
        setLoadingCategories(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoadingCategories(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCategories();
      } else {
        console.log('User is logged out');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNewCategorySave = () => {
    const newCategoryTrimmed = newCategory.replace(/\s+/g, '');
    const trimmedCat = newCategory.trim()
    if (newCategoryTrimmed) { // Check if the trimmed category is not empty
      setCategories(prevCategories => ({
        ...prevCategories,
        [newCategoryTrimmed]: { name: trimmedCat }
      }));
  
      // Set selected category to the new category
      setSelectedCategoryLocal(newCategoryTrimmed);
  
      // Reset newCategory state
      setNewCategory('');
  
      // Focus on the input field after saving
      if (newCategoryInputRef.current) {
        newCategoryInputRef.current.focus();
      }
    } else {
      console.log('New category name is empty or contains only spaces.');
    }
  };
  

  return (
    <div>
      <div style={{ margin: "8px" }}>
        {loadingCategories ? (
          <p>Loading global Categories...</p>
        ) : Object.keys(categories).length > 0 ? (
          <p>Loaded global Categories</p>
        ) : (
          <p>Failed to load global Categories </p>
        )}

        <label>Select Category: </label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategoryLocal(e.target.value)}>
          <option value="">Choose a Category</option>
          {Object.keys(categories).map((categoryKey) => (
            <option key={categoryKey} value={categoryKey}>
              {categories[categoryKey].name}
            </option>
          ))}

          <option value="__new_category">Add New Category</option>
        </select>
        {/* Add New Category input field */}
        {selectedCategory === "__new_category" && (
          <div style={{ marginTop: "5px" }}>
            <input
              type="text"
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value.replace(/[^a-zA-Z0-9\s_-]/g, ''))}
              style={{ marginRight: "5px" }}
              ref={newCategoryInputRef}
              autoFocus
            />
            <button onClick={() => {
              handleNewCategorySave();
            }}>Save</button>
          </div>
        )}

        {selectedCategory && (
          <div style={{ margin: "8px" }}>
            <label>Select Subcategory: </label>
            <select value={selectedSubcategory} onChange={(e) => setSelectedSubCategoryLocal(e.target.value)}>
              <option value="">Choose a Subcategory</option>
              {Object.keys(categories[selectedCategory] || {}).map((subcategoryKey) => (
                // Exclude 'name' key assuming it's not a subcategory key
                subcategoryKey !== 'name' && (
                  <option key={subcategoryKey} value={subcategoryKey}>
                    {categories[selectedCategory][subcategoryKey].name}
                  </option>
                )
              ))}
              <option value="__new_subcategory">Add New Subcategory</option>
            </select>
            {selectedSubcategory === "__new_subcategory" && (
              <div style={{ marginTop: "5px" }}>
                <input
                  type="text"
                  placeholder="Enter new subcategory"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  style={{ marginRight: "5px" }}
                  autoFocus
                />
                <button onClick={handleNewSubcategorySave}>Save</button>
              </div>
            )}

            {selectedSubcategory && (
              <div style={{ margin: "8px" }}>
                <label>Select Sub-Subcategory (optional): </label>
                <select value={selectedSubSubcategory} onChange={(e) => setSelectedSubSubCategoryLocal(e.target.value)}>
                  <option value="">Choose a Sub-Subcategory</option>
                  {Object.keys(categories[selectedCategory][selectedSubcategory] || {}).map((subSubcategoryKey) => (
                    // Exclude 'name' key assuming it's not a subcategory key
                    subSubcategoryKey !== 'name' && (
                      <option key={subSubcategoryKey} value={subSubcategoryKey}>
                        {categories[selectedCategory][selectedSubcategory][subSubcategoryKey].name}
                      </option>
                    )
                  ))}
                  <option value="__new_subsubcategory">Add New Sub-Subcategory</option>
                </select>
                {selectedSubSubcategory === "__new_subsubcategory" && (
                  <div style={{ marginTop: "5px" }}>
                    <input
                      type="text"
                      placeholder="Enter new sub-subcategory"
                      value={newSubSubcategory}
                      onChange={(e) => setNewSubSubcategory(e.target.value)}
                      style={{ marginRight: "5px" }}
                      autoFocus
                    />
                    <button onClick={handleNewSubSubcategorySave}>Save</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

CategorySelector.propTypes = {
  setSelectedCategory: PropTypes.func,
  setSelectedSubcategory: PropTypes.func,
  setSelectedSubSubcategory: PropTypes.func,
};

export default CategorySelector;
