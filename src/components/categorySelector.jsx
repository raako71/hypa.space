import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { getDocs, collection } from 'firebase/firestore/lite';
import { auth, db } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore/lite';
import merge from 'lodash/merge';

const CategorySelector = ({
  sendCategories, //pass full category object when changed.
  selectedCat,
  setSelectedCategory,
  selectedSubCat,
  selectedSubSubCat,
  allowNewCats,
  onCategoriesLoaded
}) => {
  const [categoriesObject, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState("Waiting to load Categories");
  const [loadingUserCategories, setLoadingUserCategories] = useState("");
  const [loadingTextStyle, setLoadingTextStyle] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newSubSubcategory, setNewSubSubcategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubcategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubcategory] = useState('');
  const newCategoryInputRef = useRef(null); // Define ref for the new category input
  const newSubcategoryInputRef = useRef(null); // Define ref for the new subcategory input
  const newSubSubcategoryInputRef = useRef(null); // Define ref for the new sub-subcategory input

  useEffect(() => {
    // Function to fetch local categories data
    const fetchAllCategories = async (userID) => {
      let categoriesData = {};
      let mergedCategories = {}; // Initialize mergedCategories here
      let loadedCatsVar = 0;
      try {
        setLoadingCategories("Loading Global Categories.");
        const categoriesCollectionRef = collection(db, 'categories');
        const querySnapshot = await getDocs(categoriesCollectionRef);
        querySnapshot.forEach((doc) => {
          const categoryName = doc.id;
          const categoryData = doc.data();
          categoriesData[categoryName] = categoryData;
        });
        setCategories(categoriesData);
        setLoadingCategories("Loaded Global Categories");
        loadedCatsVar = loadedCatsVar + 1;
      } catch (error) {
        setLoadingCategories("Failed to load Global Categories.");
        console.error('Error fetching Global categories:', error);
      }
      
      try {
        setLoadingUserCategories("Loading User Categories.");
        // Fetch existing category tree from user document
        const userDocRef = doc(db, 'users', userID);
        const userDocSnapshot = await getDoc(userDocRef);
        const existingData = userDocSnapshot.data();
        const existingCategoryTree = existingData?.categoryTree || {};
        // Deep merge the existing category tree with the global categories
        mergedCategories = merge({}, categoriesData, existingCategoryTree); // Update mergedCategories here
        // Update the categories state with the merged category tree
        setCategories(mergedCategories);
        setLoadingUserCategories("Loaded User Categories");
        loadedCatsVar = loadedCatsVar + 1;
      } catch (error) {
        setLoadingUserCategories("Failed to load User Categories.");
        console.error('Error fetching local categories:', error);
      }
    
      if (loadedCatsVar > 1) {
        if (onCategoriesLoaded) {
          onCategoriesLoaded();
        }
        setLoadingTextStyle({ display: 'none' });
      }
    };    

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userID = user.uid;
        fetchAllCategories(userID);
      } else {
        console.log('User is logged out');
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sendCategories) {
      sendCategories(categoriesObject)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesObject]);

  useEffect(() => {
    if (selectedCat) {
      selectedCat(selectedCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubCat) {
      selectedSubCat(selectedSubCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubCategory]);

  useEffect(() => {
    if (selectedSubSubCat) {
      selectedSubCat(selectedSubSubCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubSubCategory]);


  

  const handleNewCategorySave = () => {
    const newCategoryTrimmed = newCategory.replace(/\s+/g, '');
    const trimmedCat = newCategory.trim();
    if (newCategoryTrimmed) {
      setCategories((prevCategories) => ({
        ...prevCategories,
        [newCategoryTrimmed]: { name: trimmedCat },
      }));

      setSelectedCategory(newCategoryTrimmed);
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

      setSelectedSubcategory(newSubcategoryTrimmed);
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
          [selectedSubCategory]: {
            ...prevCategories[selectedCategory][selectedSubCategory],
            [newSubSubcategoryTrimmed]: { name: trimmedSubSub },
          },
        },
      }));

      setSelectedSubSubcategory(newSubSubcategoryTrimmed);
      setNewSubSubcategory('');

      if (newSubSubcategoryInputRef.current) {
        newSubSubcategoryInputRef.current.focus();
      }
    } else {
      console.log('New sub-subcategory name is empty or contains only spaces.');
    }
  };
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setSelectedCategory(selectedCategory);
    setSelectedSubcategory(''); // Reset selected subcategory
    setSelectedSubSubcategory(''); // Reset selected sub-subcategory
  };

  const handleSubcategoryChange = (e) => {
    const selectedSubcategory = e.target.value;
    setSelectedSubcategory(selectedSubcategory);
    setSelectedSubSubcategory(''); // Reset selected sub-subcategory
  };

  function filterCategoryInput(value) {
    let filteredValue = value.replace(/[^a-zA-Z0-9\s_-]/g, '');
    filteredValue = filteredValue.slice(0, 20);
    return filteredValue;
  }

  return (
    <div>
      <p style={loadingTextStyle}>{loadingCategories}&nbsp; {loadingUserCategories}</p>
      <div>
        <label>Select Category: </label>
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">Choose a Category</option>
          {Object.keys(categoriesObject).map((categoryKey) => (
            <option key={categoryKey} value={categoryKey}>
              {categoriesObject[categoryKey].name}
            </option>
          ))}
          {allowNewCats && <option value="__new_category">Add New Category</option>}
        </select>
        {allowNewCats && selectedCategory === '__new_category' && (
          <div style={{ marginTop: '5px' }}>
            <input
              type="text"
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(filterCategoryInput(e.target.value))}
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
            <select value={selectedSubCategory} onChange={handleSubcategoryChange}>
              <option value="">Choose a Subcategory</option>
              {Object.keys(categoriesObject[selectedCategory] || {}).map((subcategoryKey) => (
                subcategoryKey !== 'name' && (
                  <option key={subcategoryKey} value={subcategoryKey}>
                    {categoriesObject[selectedCategory][subcategoryKey].name}
                  </option>
                )
              ))}
              {allowNewCats && <option value="__new_subcategory">Add New Subcategory</option>}
            </select>

            {allowNewCats && selectedSubCategory === '__new_subcategory' && (
              <div style={{ marginTop: '5px' }}>
                <input
                  type="text"
                  placeholder="Enter new subcategory"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(filterCategoryInput(e.target.value))}
                  style={{ marginRight: '5px' }}
                  ref={newSubcategoryInputRef}
                  autoFocus
                />
                <button onClick={handleNewSubcategorySave}>Save</button>
              </div>
            )}

            {selectedCategory !== '__new_category' && selectedSubCategory !== '__new_subcategory' && selectedSubCategory && (
              <div style={{ margin: '8px' }}>
                <label>Select Sub-Subcategory{allowNewCats ? ' (optional)' : ''}: </label>
                <select value={selectedSubSubCategory} onChange={(e) => setSelectedSubSubcategory(e.target.value)}>
                  <option value="">Choose a Sub-Subcategory</option>
                  {Object.keys(categoriesObject[selectedCategory][selectedSubCategory] || {}).map((subSubcategoryKey) => (
                    subSubcategoryKey !== 'name' && (
                      <option key={subSubcategoryKey} value={subSubcategoryKey}>
                        {categoriesObject[selectedCategory][selectedSubCategory][subSubcategoryKey].name}
                      </option>
                    )
                  ))}
                  {allowNewCats && <option value="__new_subsubcategory">Add New Sub-Subcategory</option>}
                </select>

                {allowNewCats && selectedSubSubCategory === '__new_subsubcategory' && (
                  <div style={{ marginTop: '5px' }}>
                    <input
                      type="text"
                      placeholder="Enter new sub-subcategory"
                      value={newSubSubcategory}
                      onChange={(e) => setNewSubSubcategory(filterCategoryInput(e.target.value))}
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
  selectedCat: PropTypes.func,
  selectedSubCat: PropTypes.func,
  selectedSubSubCat: PropTypes.func,
  setSelectedCategory: PropTypes.string,
  allowNewCats: PropTypes.bool,
  onCategoriesLoaded: PropTypes.func // Callback function to pass loadedCats to the parent component
};

export default CategorySelector;
