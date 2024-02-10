import CategorySelector from "./categorySelector";
import Variations from "./variations";
import { useEffect, useState } from 'react';
import { auth, db } from "../firebase-config"
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore/lite';
import { onAuthStateChanged } from 'firebase/auth';
import ImageModification from "./imageUpload";
import { getStorage, ref, uploadString } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

const NewProd = () => {
  const [productName, setProductName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [variations, setVariations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [userID, setUserID] = useState(null);
  const [passedImages, setPassedImages] = useState({ scaled: [], unscaled: [] });
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null); // New state variable
  const [categories, setCategories] = useState([]);


  const navigate = useNavigate();


  useEffect(() => {
    const categoryTree = {};
    // Add selected category if it exists
    if (selectedCategory) {
      const categoryName = categories[selectedCategory]?.name;
      if (categoryName) {
        categoryTree[selectedCategory] = { name: categoryName };
        // Add selected subcategory if it exists
        if (selectedSubcategory) {
          const subcategoryName = categories[selectedCategory][selectedSubcategory]?.name;
          if (subcategoryName) {
            categoryTree[selectedCategory][selectedSubcategory] = { name: subcategoryName };
            // Add selected subsubcategory if it exists
            if (selectedSubSubcategory) {
              const subSubcategoryName = categories[selectedCategory][selectedSubcategory][selectedSubSubcategory]?.name;
              if (subSubcategoryName) {
                categoryTree[selectedCategory][selectedSubcategory][selectedSubSubcategory] = { name: subSubcategoryName };
              }
            }
          }
        }
      }
    }

  }, [categories, selectedCategory, selectedSubcategory, selectedSubSubcategory]);


  const handleProcessedImagesUpload = (images) => {
    const scaledDataURLs = images.scaled.toDataURL();
    const unscaledDataURLs = images.unscaled.toDataURL();
    const currentScaledImages = [...passedImages.scaled];
    const currentUnscaledImages = [...passedImages.unscaled];
    if (currentScaledImages.length < 10) {
      currentScaledImages.push(scaledDataURLs);
    }
    if (currentUnscaledImages.length < 10) {
      currentUnscaledImages.push(unscaledDataURLs);
    }
    setPassedImages({
      scaled: currentScaledImages,
      unscaled: currentUnscaledImages
    });
  };

  useEffect(() => {
    // Check if both category and subcategory are selected
    if (selectedCategory !== null && selectedSubcategory !== null) {
      // Reset the error message
      setErrorMessage("");
    }
    if (productName !== "") setErrorMessage("");
  }, [selectedCategory, selectedSubcategory, productName]);
  const handleProductDescriptionChange = (event) => {
    const newDescription = event.target.value;
    try {
      // Check for potentially harmful content
      if (containsHarmfulContent(newDescription)) {
        throw new Error("Disallowed characters blocked.");
      }
      // Validate product description only if it's not empty
      if (newDescription.length > 1000) {
        throw new Error("Max description length reached.");
      }
      setProductDescription(newDescription);
    } catch (error) {
      console.error(error.message);
    }
  };


  const handleProductNameChange = (event) => {
    const newName = event.target.value;
    try {
      if (containsHarmfulContent(newName)) {
        throw new Error("Product name contains disallowed content.");
      }
      if (newName.length > 30) {
        throw new Error("Product name should be 30 characters or less.");
      }
      setProductName(newName);
    }
    catch (error) {
      console.error(error.message);
    }
  };
  const containsHarmfulContent = (description) => {
    const harmfulPatterns = /[^0-9a-zA-Z\s_-]/;
    return harmfulPatterns.test(description);
  };

  // grab UserID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userID = user.uid;
        setUserID(userID);
      }
    });
    return () => {
      unsubscribe(); // Cleanup the listener on component unmount
    };
  }, [userID]);


  const uploadImagesToStorage = async (images, userID, productDocumentName) => {
    const storage = getStorage();
    const storageRef = ref(storage, `users/${userID}/${productDocumentName}`);
    const uploadImage = async (imageData, imageName) => {
      const imageRef = ref(storageRef, imageName);
      await uploadString(imageRef, imageData, 'data_url');
    };
    const uploadImages = async (imageURLs, prefix) => {
      await Promise.all(
        imageURLs.map(async (imageURL, index) => {
          const imageName = `${prefix}${index}`;
          await uploadImage(imageURL, imageName);
        })
      );
    };
    try {
      await Promise.all([
        uploadImages(images.scaled, 'S'),
        uploadImages(images.unscaled, 'L')
      ]);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };


  const updateCategoriesInUserFile = async () => {
    try {
      //update categories in user file
      const userDocRef = doc(db, 'users', userID);
      const userDocSnapshot = await getDoc(userDocRef);
      const existingData = userDocSnapshot.data();
      const existingCategoryTree = existingData?.categoryTree || {};
      const categoryTreeUpdate = {};
      if (selectedCategory) {
        const categoryName = categories[selectedCategory]?.name;
        if (categoryName) {
          categoryTreeUpdate[selectedCategory] = { name: categoryName };
          if (selectedSubcategory) {
            const subcategoryName = categories[selectedCategory][selectedSubcategory]?.name;
            if (subcategoryName) {
              categoryTreeUpdate[selectedCategory][selectedSubcategory] = { name: subcategoryName };
              if (selectedSubSubcategory) {
                const subSubcategoryName = categories[selectedCategory][selectedSubcategory][selectedSubSubcategory]?.name;
                if (subSubcategoryName) {
                  categoryTreeUpdate[selectedCategory][selectedSubcategory][selectedSubSubcategory] = { name: subSubcategoryName };
                }
              }
            }
          }
        }
      }
      const mergedCategoryTree = _.merge({}, existingCategoryTree, categoryTreeUpdate)
      if (Object.keys(mergedCategoryTree).length > 0) {
        await updateDoc(userDocRef, { categoryTree: mergedCategoryTree });
      }
    } catch (error) {
      console.error('Error updating categories in user file:', error);
      throw error; // Rethrow the error to handle it in the main function
    }
  };


  const uploadImages = async () => {
    try {
      // Upload images
      const storage = getStorage();
      const userDirectoryRef = ref(storage, `users/${userID}`);
      await uploadString(userDirectoryRef, '');
      const productNameWithoutSpaces = productName.replace(/\s+/g, '');
      const productDocumentName = `${productNameWithoutSpaces}_${userID}`;
      const productDirectoryRef = ref(storage, `users/${userID}/${productDocumentName}`);
      await uploadString(productDirectoryRef, '');
      if (passedImages.scaled.length > 0 || passedImages.unscaled.length > 0) {
        try {
          await uploadImagesToStorage(passedImages, userID, productDocumentName);
          setPassedImages({ scaled: [], unscaled: [] });
        } catch (error) {
          console.error('Error uploading images:', error);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error; // Rethrow the error to handle it in the main function
    }
  };

  const updateProductTreeInUserFile = async () => {
    const productNameWithoutSpaces = productName.replace(/\s+/g, '');
    const productDocumentName = `${productNameWithoutSpaces}_${userID}`;
    try {
      //update categories in user file
      const userDocRef = doc(db, 'users', userID);
      const userDocSnapshot = await getDoc(userDocRef);
      const existingData = userDocSnapshot.data();
      const existingproductTree = existingData?.productTree || {};
      console.log("existingproductTree:", JSON.stringify(existingproductTree, null, 2));
      const productTreeUpdate = {};
      productTreeUpdate[selectedCategory] = {};
      productTreeUpdate[selectedCategory][selectedSubcategory] = {};
      if (selectedSubSubcategory) {
        productTreeUpdate[selectedCategory][selectedSubcategory][selectedSubSubcategory] = {};
        productTreeUpdate[selectedCategory][selectedSubcategory][selectedSubSubcategory].products = { [productDocumentName]: true };
      }
      else {
        productTreeUpdate[selectedCategory][selectedSubcategory].products = { [productDocumentName]: true };
      }
      const mergedProductTree = _.merge({}, existingproductTree, productTreeUpdate)
      console.log("mergedProductTree:", JSON.stringify(mergedProductTree, null, 2));
      if (Object.keys(mergedProductTree).length > 0) {
        await updateDoc(userDocRef, { productTree: mergedProductTree });
      }
    } catch (error) {
      console.error('Error updating productTree in user file:', error);
      throw error; // Rethrow the error to handle it in the main function
    }
  };


  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      if (!selectedCategory || !selectedSubcategory) {
        throw new Error("Category and Subcategory are not selected.");
      }
      if (productName === "") {
        throw new Error("Empty Product Name");
      }

      // Rest of your code...
      //Update product in DB
      const productNameWithoutSpaces = productName.replace(/\s+/g, '');
      const productDocumentName = `${productNameWithoutSpaces}_${userID}`;
      const userProductRef = doc(db, 'products', productDocumentName);
      const categoryUpdate = {};
      if (selectedCategory) {
        categoryUpdate[selectedCategory] = { name: categories[selectedCategory]?.name };
        if (selectedSubcategory) {
          categoryUpdate[selectedCategory][selectedSubcategory] = {
            name: categories[selectedCategory]?.[selectedSubcategory]?.name
          };
          if (selectedSubSubcategory && categories[selectedCategory][selectedSubcategory][selectedSubSubcategory]) {
            categoryUpdate[selectedCategory][selectedSubcategory][selectedSubSubcategory] = {
              name: categories[selectedCategory][selectedSubcategory][selectedSubSubcategory].name
            };
          }
        }
      }
      const productData = {
        productName,
        productDescription,
        variations,
        category: categoryUpdate,
        userId: userID,
        images: passedImages.scaled.length > 0 || passedImages.unscaled.length > 0
      };
      const docSnapshot = await getDoc(userProductRef);
      if (docSnapshot.exists()) {
        console.log('Product exists!');
        // Ask for confirmation before updating
        const shouldUpdate = window.confirm('Confirm overwriting existing product?');
        if (shouldUpdate) {
          // If the user confirms, update the document
          await updateDoc(userProductRef, productData);
          await updateCategoriesInUserFile();
          await updateProductTreeInUserFile();
          await uploadImages();
          console.log('Product updated successfully!');
          return navigate(`/product?productName=${productDocumentName}`);
        } else {
          console.log('Update cancelled by user.');
        }
      } else {
        // If the document doesn't exist, create a new one
        await setDoc(userProductRef, productData);
        await updateCategoriesInUserFile();
        await uploadImages();
        console.log('Product saved successfully!');
        return navigate(`/product?productName=${productDocumentName}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setErrorMessage(error.message);
    }
    setSaving(false);
  };


  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>Add New Product</h1>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
        <label htmlFor="productName" style={{ margin: "8px" }}>Product Name:</label>
        <input
          type="text"
          id="productName"
          value={productName}
          onChange={handleProductNameChange}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", margin: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
          <label htmlFor="productDescription" style={{ marginRight: "8px" }}>Product Description:</label>
          <textarea
            id="productDescription"
            value={productDescription}
            onChange={handleProductDescriptionChange}
          />
        </div>
        <ImageModification handleProcessedImagesUpload={handleProcessedImagesUpload} />
        {passedImages.scaled.length > 0 && (
          <div>
            <h3>Scaled Images</h3>
            {passedImages.scaled.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Scaled Image ${index}`}
                style={{ margin: "10px", width: "350px" }}
              />
            ))}
          </div>
        )}
      </div>

      <Variations variations={variations} setVariations={setVariations} />

      <CategorySelector
        sendCategories={setCategories}
        setSelectedCategory={setSelectedCategory}
        setSelectedSubcategory={setSelectedSubcategory}
        setSelectedSubSubcategory={setSelectedSubSubcategory} // Pass down setSelectedSubSubcategory
      />
      <div style={{ display: "flex", alignItems: "center", margin: "8px" }}>
        {!saving && (
          <button onClick={handleSaveProduct} style={{ width: 'fit-content', margin: "8px" }}>Save</button>
        )}
        {saving && (
          <button style={{ width: 'fit-content', margin: "8px" }} disabled>Saving...</button>
        )}
        {errorMessage && (
          <p style={{ color: 'red', marginLeft: '8px' }}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default NewProd;
