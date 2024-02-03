import CategorySelector from "./categorySelector";
import Variations from "./variations";
import { useEffect, useState } from 'react';
import { auth, db } from "../firebase-config"
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore/lite';
import { onAuthStateChanged } from 'firebase/auth';
import ImageModification from "./imageUpload";
import { getStorage, ref, uploadString } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

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
      console.log('Images uploaded successfully.');
    } catch (error) {
      console.error('Error uploading images:', error);
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
      // Check if selectedSubSubcategory is empty
      if (cleanedSelectedSubSubcategory === "") {
        category = {
          [cleanedSelectedCategory]: {
            name: selectedCategory,
            [cleanedSelectedSubcategory]: {
              name: selectedSubcategory,
            }
          }
        };
      } else {
        category = {
          [cleanedSelectedCategory]: {
            name: selectedCategory,
            [cleanedSelectedSubcategory]: {
              name: selectedSubcategory,
              [cleanedSelectedSubSubcategory]: {
                name: selectedSubSubcategory,
              }
            }
          }
        };
      }
      // Update the user document with the category tree information
      const userDocRef = doc(db, 'users', userID);
      if (cleanedSelectedSubSubcategory === "") {
        const docSnapshot = await getDoc(userDocRef);
        const categoryData = docSnapshot?.data()?.categoryTree;
        if (!categoryData?.[cleanedSelectedCategory]?.[cleanedSelectedSubcategory]) {
          await updateDoc(userDocRef, {
            [`categoryTree.${cleanedSelectedCategory}.${cleanedSelectedSubcategory}`]: category[cleanedSelectedCategory][cleanedSelectedSubcategory]
          });
        }
      } else {
        await updateDoc(userDocRef, {
          categoryTree: category
        });
      }
      // Create user directory and product subdirectory in Firebase *Storage*
      const storage = getStorage();
      const userDirectoryRef = ref(storage, `users/${userID}`);
      await uploadString(userDirectoryRef, '');
      const productNameWithoutSpaces = productName.replace(/\s+/g, '');
      console.log('productName without spaces:', productNameWithoutSpaces);
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
      else console.log("No Images to upload.")
      // Save product data
      const userProductRef = doc(db, 'products', productDocumentName);
      let category = {};
      const removeSpaces = (text) => text.replace(/\s+/g, '');
      const cleanedSelectedCategory = removeSpaces(selectedCategory);
      const cleanedSelectedSubcategory = removeSpaces(selectedSubcategory);
      const cleanedSelectedSubSubcategory = removeSpaces(selectedSubSubcategory);

      const productData = {
        productName,
        productDescription,
        variations,
        category,
        userId: userID,
        images: passedImages.scaled.length > 0 || passedImages.unscaled.length > 0
        // Include other relevant data
      };
      const docSnapshot = await getDoc(userProductRef);
      if (docSnapshot.exists()) {
        console.log('Product exists!');
        // Ask for confirmation before updating
        const shouldUpdate = window.confirm('Confirm overwriting existing product?');
        if (shouldUpdate) {
          // If the user confirms, update the document
          await updateDoc(userProductRef, productData);
          console.log('Product updated successfully!');
          return navigate(`/products?productName=${productDocumentName}`);
        } else {
          console.log('Update cancelled by user.');
        }
      } else {
        // If the document doesn't exist, create a new one
        await setDoc(userProductRef, productData);
        console.log('Product saved successfully!');
        return navigate(`/products?productName=${productDocumentName}`);
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
