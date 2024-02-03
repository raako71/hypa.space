import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore/lite';
import { auth, db } from '../firebase-config';

const CategorySelector = ({ setSelectedCategory, setSelectedSubcategory, setSelectedSubSubcategory }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategoryLocal] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategoryLocal] = useState('');
  const [subSubcategories, setSubSubcategories] = useState([]);
  const [selectedSubSubcategory, setSelectedSubSubcategoryLocal] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newSubSubcategory, setNewSubSubcategory] = useState('');
  const newCategoryInputRef = useRef(null);
  const newSubcategoryInputRef = useRef(null);
  const newSubSubcategoryInputRef = useRef(null);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollectionRef = collection(db, 'categories');
        const querySnapshot = await getDocs(categoriesCollectionRef);
        const categoriesData = {};
        querySnapshot.forEach((doc) => {
          const categoryName = doc.id;
          const categoryData = doc.data();
          const subcategories = Object.keys(categoryData);
          const categoryObject = {};
          subcategories.forEach((subcategory) => {
            if (categoryData[subcategory] === true) {
              categoryObject[subcategory] = true; // No nested categories, set to true
            } else {
              // Nested categories exist, copy the nested object
              categoryObject[subcategory] = { ...categoryData[subcategory] };
            }
          });
          categoriesData[categoryName] = categoryObject;
        });
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchUserCategories = async () => {
      try {
        const userID = auth.currentUser.uid;
        const userDocRef = doc(db, 'users', userID);
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists) {
          const userData = docSnapshot.data();
          const categoryTree = userData.categoryTree;
          // Merge categoryTree with categoriesData
        const mergedCategoriesData = { ...categories, ...categoryTree };
        setCategories(mergedCategoriesData);
        } else {
          console.log('Document does not exist');
        }
      } catch (error) {
        console.error('Error fetching userID document:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCategories();
        fetchUserCategories();
      } else {
        console.log('User is logged out');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (setSelectedCategory) {
      setSelectedCategory(selectedCategory);
    }
  }, [selectedCategory, setSelectedCategory]);

  useEffect(() => {
    if (setSelectedSubcategory) {
      setSelectedSubcategory(selectedSubcategory);
    }
  }, [selectedSubcategory, setSelectedSubcategory]);

  useEffect(() => {
    if (setSelectedSubSubcategory) {
      setSelectedSubSubcategory(selectedSubSubcategory);
    }
  }, [selectedSubSubcategory, setSelectedSubSubcategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategoryLocal(category);
    if (category === "__new_category") {
      // Clear subcategory and sub-subcategory selections
      setSelectedSubcategoryLocal("");
      setSelectedSubSubcategoryLocal("");
      return; // Exit early
    }
    if (category) {
      if (categories && categories[category]) {
        setSubcategories(Object.keys(categories[category]));
        setSelectedSubcategoryLocal('');
        setSelectedSubSubcategoryLocal('');
      } else {
        console.error(`Category "${category}" does not exist in the categories state.`);
      }
    } else {
      setSubcategories([]);
      setSelectedSubcategoryLocal('');
      setSelectedSubSubcategoryLocal('');
    }
  };


  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategoryLocal(subcategory);
    setSelectedSubSubcategoryLocal('');
    
    if (subcategory === "__new_subcategory") {
      return; // Exit early if "__new_subcategory" is selected
    }
  
    if (subcategory) {
      if (categories[selectedCategory] && categories[selectedCategory][subcategory]) {
        setSubSubcategories(Object.keys(categories[selectedCategory][subcategory]));
      } else {
        console.error(`Subcategory "${subcategory}" does not exist in the categories state.`);
      }
    } else {
      setSubSubcategories([]);
    }
  };
  

  const handleSubSubcategorySelect = (subSubcategory) => {
    setSelectedSubSubcategoryLocal(subSubcategory);
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

  const handleNewSubSubcategorySave = () => {
    if (newSubSubcategory.trim() !== '') {
      const updatedCategories = {
        ...categories,
        [selectedCategory]: {
          ...categories[selectedCategory],
          [selectedSubcategory]: {
            ...categories[selectedCategory][selectedSubcategory],
            [newSubSubcategory]: {}
          }
        }
      };
      setCategories(updatedCategories);
      setSelectedSubSubcategoryLocal(newSubSubcategory); // Update selected sub-subcategory to the new one
      setSubSubcategories(Object.keys(updatedCategories[selectedCategory][selectedSubcategory]));
      setNewSubSubcategory('');
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
        {/* Add New Category input field */}
        {selectedCategory === "__new_category" && (
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
          {selectedSubcategory === "__new_subcategory" && (
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

      {selectedSubcategory && (
        <div style={{ margin: "8px" }}>
          <label>Select Sub-subcategory (optional): </label>
          <select value={selectedSubSubcategory} onChange={(e) => handleSubSubcategorySelect(e.target.value)}>
            <option value="">Choose a Sub-subcategory</option>
            {subSubcategories.map((subSubcategory) => (
              <option key={subSubcategory} value={subSubcategory}>
                {subSubcategory}
              </option>
            ))}
            <option value="__new_subsubcategory">Add New Sub-subcategory</option>
          </select>
          {selectedSubSubcategory === "__new_subsubcategory" && (
            <div style={{ marginTop: "5px" }}>
              <input
                type="text"
                placeholder="Enter new sub-subcategory"
                value={newSubSubcategory}
                onChange={(e) => setNewSubSubcategory(e.target.value)}
                style={{ marginRight: "5px" }}
                ref={newSubSubcategoryInputRef}
              />
              <button onClick={() => {
                handleNewSubSubcategorySave();
                if (newSubSubcategoryInputRef.current) {
                  newSubSubcategoryInputRef.current.focus();
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
  setSelectedSubSubcategory: PropTypes.func,
};

export default CategorySelector;
