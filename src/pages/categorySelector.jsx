import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { getDocs, collection } from 'firebase/firestore/lite';
import { auth, db } from '../firebase-config';

const CategorySelector = ({
  sendCategories,
  setSelectedCategory,
  setSelectedSubcategory,
  setSelectedSubSubcategory,
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategoryLocal] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedSubcategory, setSelectedSubCategoryLocal] = useState('');
  const [selectedSubSubcategory, setSelectedSubSubCategoryLocal] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newSubSubcategory, setNewSubSubcategory] = useState('');
  const newCategoryInputRef = useRef(null); // Define ref for the new category input
  const newSubcategoryInputRef = useRef(null); // Define ref for the new subcategory input
  const newSubSubcategoryInputRef = useRef(null); // Define ref for the new sub-subcategory input

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

  useEffect(() => {
    if(sendCategories){
      sendCategories(categories)}
    setSelectedCategory(selectedCategory);
    setSelectedSubcategory(selectedSubcategory);
    setSelectedSubSubcategory(selectedSubSubcategory);
  }, [sendCategories, categories, selectedCategory, selectedSubcategory, selectedSubSubcategory]);

  const handleNewCategorySave = () => {
    const newCategoryTrimmed = newCategory.replace(/\s+/g, '');
    const trimmedCat = newCategory.trim();
    if (newCategoryTrimmed) {
      setCategories((prevCategories) => ({
        ...prevCategories,
        [newCategoryTrimmed]: { name: trimmedCat },
      }));

      setSelectedCategoryLocal(newCategoryTrimmed);
      setNewCategory('');

      if (newCategoryInputRef.current) {
        newCategoryInputRef.current.focus();
      }
    } else {
      console.log('New category name is empty or contains only spaces.');
    }
  };

  const handleNewSubcategorySave = () => {
    const newSubcategoryTrimmed = newSubcategory.replace(/\s+/g, '');
    const trimmedSub = newSubcategory.trim();
    if (newSubcategoryTrimmed) {
      setCategories((prevCategories) => ({
        ...prevCategories,
        [selectedCategory]: {
          ...prevCategories[selectedCategory],
          [newSubcategoryTrimmed]: { name: trimmedSub },
        },
      }));

      setSelectedSubCategoryLocal(newSubcategoryTrimmed);
      setNewSubcategory('');

      if (newSubcategoryInputRef.current) {
        newSubcategoryInputRef.current.focus();
      }
    } else {
      console.log('New subcategory name is empty or contains only spaces.');
    }
  };

  const handleNewSubSubcategorySave = () => {
    const newSubSubcategoryTrimmed = newSubSubcategory.replace(/\s+/g, '');
    const trimmedSubSub = newSubSubcategory.trim();
    if (newSubSubcategoryTrimmed) {
      setCategories((prevCategories) => ({
        ...prevCategories,
        [selectedCategory]: {
          ...prevCategories[selectedCategory],
          [selectedSubcategory]: {
            ...prevCategories[selectedCategory][selectedSubcategory],
            [newSubSubcategoryTrimmed]: { name: trimmedSubSub },
          },
        },
      }));

      setSelectedSubSubCategoryLocal(newSubSubcategoryTrimmed);
      setNewSubSubcategory('');

      if (newSubSubcategoryInputRef.current) {
        newSubSubcategoryInputRef.current.focus();
      }
    } else {
      console.log('New sub-subcategory name is empty or contains only spaces.');
    }
  };

  return (
    <div>
      <div style={{ margin: '8px' }}>
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

        {selectedCategory === '__new_category' && (
          <div style={{ marginTop: '5px' }}>
            <input
              type="text"
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value.replace(/[^a-zA-Z0-9\s_-]/g, ''))}
              style={{ marginRight: '5px' }}
              ref={newCategoryInputRef}
              autoFocus
            />
            <button onClick={handleNewCategorySave}>Save</button>
          </div>
        )}

        {selectedCategory && selectedCategory !== '__new_category' && (
          <div style={{ margin: '8px' }}>
            <label>Select Subcategory: </label>
            <select value={selectedSubcategory} onChange={(e) => setSelectedSubCategoryLocal(e.target.value)}>
              <option value="">Choose a Subcategory</option>
              {Object.keys(categories[selectedCategory] || {}).map((subcategoryKey) => (
                subcategoryKey !== 'name' && (
                  <option key={subcategoryKey} value={subcategoryKey}>
                    {categories[selectedCategory][subcategoryKey].name}
                  </option>
                )
              ))}
              <option value="__new_subcategory">Add New Subcategory</option>
            </select>

            {selectedSubcategory === '__new_subcategory' && (
              <div style={{ marginTop: '5px' }}>
                <input
                  type="text"
                  placeholder="Enter new subcategory"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value.replace(/[^a-zA-Z0-9\s_-]/g, ''))}
                  style={{ marginRight: '5px' }}
                  ref={newSubcategoryInputRef}
                  autoFocus
                />
                <button onClick={handleNewSubcategorySave}>Save</button>
              </div>
            )}

            {selectedCategory !== '__new_category' && selectedSubcategory !== '__new_subcategory' && selectedSubcategory && (
              <div style={{ margin: '8px' }}>
                <label>Select Sub-Subcategory (optional): </label>
                <select value={selectedSubSubcategory} onChange={(e) => setSelectedSubSubCategoryLocal(e.target.value)}>
                  <option value="">Choose a Sub-Subcategory</option>
                  {Object.keys(categories[selectedCategory][selectedSubcategory] || {}).map((subSubcategoryKey) => (
                    subSubcategoryKey !== 'name' && (
                      <option key={subSubcategoryKey} value={subSubcategoryKey}>
                        {categories[selectedCategory][selectedSubcategory][subSubcategoryKey].name}
                      </option>
                    )
                  ))}
                  <option value="__new_subsubcategory">Add New Sub-Subcategory</option>
                </select>

                {selectedSubSubcategory === '__new_subsubcategory' && (
                  <div style={{ marginTop: '5px' }}>
                    <input
                      type="text"
                      placeholder="Enter new sub-subcategory"
                      value={newSubSubcategory}
                      onChange={(e) => setNewSubSubcategory(e.target.value.replace(/[^a-zA-Z0-9\s_-]/g, ''))}
                      style={{ marginRight: '5px' }}
                      ref={newSubSubcategoryInputRef}
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
  sendCategories: PropTypes.func,
  setSelectedCategory: PropTypes.func,
  setSelectedSubcategory: PropTypes.func,
  setSelectedSubSubcategory: PropTypes.func,
};

export default CategorySelector;
