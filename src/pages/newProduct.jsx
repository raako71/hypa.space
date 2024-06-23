import CategorySelector from "../components/categorySelector";
import Variations from "../components/variations";
import { useEffect, useState } from 'react';
import { auth, db } from "../firebase-config"
import { getFirestore, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore/lite';
import { onAuthStateChanged } from 'firebase/auth';
import ImageModification from "../components/imageUpload";
import { getStorage, ref, uploadString, getDownloadURL, listAll } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import merge from 'lodash/merge';
import PropTypes from 'prop-types';

const NewProd = ({ productNameUserID }) => {
  const [productName, setProductName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [variations, setVariations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubcategory] = useState('');
  const [userID, setUserID] = useState(null);
  const [passedImages, setPassedImages] = useState({ scaled: [], unscaled: [] });
  const [selectedSubSubCategory, setSelectedSubSubcategory] = useState(''); // New state variable
  const [categories, setCategories] = useState([]);
  const allowNewCats = true;
  const navigate = useNavigate();
  //const [productInfo, setProductInfo] = useState(null);
  const [imageCheck, setImageCheck] = useState(false);
  const [loadingImages, setloadingImages] = useState(false);

  const getProductInfo = async (productNameUserID) => {
    try {
      const firestore = getFirestore();
      const productDocRef = doc(firestore, 'products', productNameUserID);
      const productSnapshot = await getDoc(productDocRef);
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        //setProductInfo(productData);
        setProductName(productData.productName);
        setProductDescription(productData.productDescription);
        setVariations(productData.variations || []); // Set variations if available
        // Set category information if available
        if (productData) {
          const [, userID] = productNameUserID.split('_');
          indexImages(userID, productData.images);
        }
      } else {
        setImageCheck(true);
        console.error('Product document not found.');
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
      //setTimeout(() => handleReload(), 3000);
    }
  };

  useEffect(() => {
    if (productNameUserID !== "") {
      getProductInfo(productNameUserID);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  //pull existing images
  const indexImages = async (userID, hasImages) => {
    const basePath = `users/${userID}/${productNameUserID}`;

    if (hasImages) {
      setloadingImages(true);
      const storage = getStorage();
      let totalImages = 0;
      const directoryRef = ref(storage, basePath);
      try {
        const listResult = await listAll(directoryRef);
        listResult.items.forEach((itemRef) => {   
          const fileName = itemRef.name;
          if (fileName.startsWith('S')) {
            const numberPart = parseInt(fileName.substring(1)); // Extract number after 'S'
            if (!isNaN(numberPart) && numberPart > totalImages) {
              totalImages = numberPart; // Increment to the next number
            }
          }
        });
      } catch (error) {
        console.error("Error listing files:", error);
      }
      const scaledUrls = [];
      const unscaledUrls = [];
      for (let i = 0; i <= totalImages; i++) {
        const imagePathS = `${basePath}/S${i}`;
        const imagePathL = `${basePath}/L${i}`;
        try {
          const urlS = await getDownloadURL(ref(storage, imagePathS));
          scaledUrls.push(urlS); // Collect each urlS into the scaledUrls array
        } catch (error) {
          console.error(error)
          break;
        }
        try {
          const urlL = await getDownloadURL(ref(storage, imagePathL));
          unscaledUrls.push(urlL); // Collect each urlS into the scaledUrls array
        } catch (error) {
          console.error(error)
          break;
        }
      }
      setPassedImages({
        scaled: scaledUrls,
        unscaled: unscaledUrls
      });
      setImageCheck(true);
      setloadingImages(false);
    }
  };

  //category selector
  useEffect(() => {
    const categoryTree = {};
    // Add selected category if it exists
    if (selectedCategory) {
      const categoryName = categories[selectedCategory]?.name;
      if (categoryName) {
        categoryTree[selectedCategory] = { name: categoryName };
        // Add selected subcategory if it exists
        if (selectedSubCategory) {
          const subcategoryName = categories[selectedCategory][selectedSubCategory]?.name;
          if (subcategoryName) {
            categoryTree[selectedCategory][selectedSubCategory] = { name: subcategoryName };
            // Add selected subsubcategory if it exists
            if (selectedSubSubCategory) {
              const subSubcategoryName = categories[selectedCategory][selectedSubCategory][selectedSubSubCategory]?.name;
              if (subSubcategoryName) {
                categoryTree[selectedCategory][selectedSubCategory][selectedSubSubCategory] = { name: subSubcategoryName };
              }
            }
          }
        }
      }
    }

  }, [categories, selectedCategory, selectedSubCategory, selectedSubSubCategory]);

  const handleProcessedImagesUpload = (images) => {
    const scaledDataURL = images.scaled.toDataURL('image/jpeg');
    const unscaledDataURL = images.unscaled.toDataURL('image/jpeg');
    
    const currentScaledImages = [...passedImages.scaled];
    const currentUnscaledImages = [...passedImages.unscaled];
    
    if (currentScaledImages.length < 10) {
      currentScaledImages.push(scaledDataURL);
    }
    
    if (currentUnscaledImages.length < 10) {
      currentUnscaledImages.push(unscaledDataURL);
    }
    
    setPassedImages({
      scaled: currentScaledImages,
      unscaled: currentUnscaledImages
    });
  };
  

  useEffect(() => {
    // Check if both category and subcategory are selected
    if (selectedCategory !== null && selectedSubCategory !== null) {
      // Reset the error message
      setErrorMessage("");
    }
    if (productName !== "") setErrorMessage("");
  }, [selectedCategory, selectedSubCategory, productName]);

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

  const isValidDataUrl = (url) => {
    // Regular expression to match a valid Data URL format
    const dataUrlRegex = /^data:([A-Za-z-+/]+);base64,(.+)$/;
  
    return dataUrlRegex.test(url);
  };


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
          if (isValidDataUrl(imageURL)) {
            await uploadImage(imageURL, imageName);
          } else {
            console.log("skipping...")
          }
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
          if (selectedSubCategory) {
            const subcategoryName = categories[selectedCategory][selectedSubCategory]?.name;
            if (subcategoryName) {
              categoryTreeUpdate[selectedCategory][selectedSubCategory] = { name: subcategoryName };
              if (selectedSubSubCategory) {
                const subSubcategoryName = categories[selectedCategory][selectedSubCategory][selectedSubSubCategory]?.name;
                if (subSubcategoryName) {
                  categoryTreeUpdate[selectedCategory][selectedSubCategory][selectedSubSubCategory] = { name: subSubcategoryName };
                }
              }
            }
          }
        }
      }
      const mergedCategoryTree = merge({}, existingCategoryTree, categoryTreeUpdate)
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
      //console.log("existingproductTree:", JSON.stringify(existingproductTree, null, 2));
      const productTreeUpdate = {};
      productTreeUpdate[selectedCategory] = {};
      productTreeUpdate[selectedCategory][selectedSubCategory] = {};
      if (selectedSubSubCategory) {
        productTreeUpdate[selectedCategory][selectedSubCategory][selectedSubSubCategory] = {};
        productTreeUpdate[selectedCategory][selectedSubCategory][selectedSubSubCategory].products = { [productDocumentName]: true };
      }
      else {
        productTreeUpdate[selectedCategory][selectedSubCategory].products = { [productDocumentName]: true };
      }
      const mergedProductTree = merge({}, existingproductTree, productTreeUpdate)
      //console.log("mergedProductTree:", JSON.stringify(mergedProductTree, null, 2));
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
      if (!selectedCategory || !selectedSubCategory) {
        throw new Error("Category and Subcategory are not selected.");
      }
      if (productName === "") {
        throw new Error("Empty Product Name");
      }

      //Update product in DB
      const productNameWithoutSpaces = productName.replace(/\s+/g, '');
      const productDocumentName = `${productNameWithoutSpaces}_${userID}`;
      const userProductRef = doc(db, 'products', productDocumentName);
      const categoryUpdate = {};
      if (selectedCategory) {
        categoryUpdate[selectedCategory] = { name: categories[selectedCategory]?.name };
        if (selectedSubCategory) {
          categoryUpdate[selectedCategory][selectedSubCategory] = {
            name: categories[selectedCategory]?.[selectedSubCategory]?.name
          };
          if (selectedSubSubCategory && categories[selectedCategory][selectedSubCategory][selectedSubSubCategory]) {
            categoryUpdate[selectedCategory][selectedSubCategory][selectedSubSubCategory] = {
              name: categories[selectedCategory][selectedSubCategory][selectedSubSubCategory].name
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
        await updateProductTreeInUserFile();
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
    <div style={{ display: "flex", flexDirection: "column", padding: '25px' }}>
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
        {imageCheck && (
        <ImageModification handleProcessedImagesUpload={handleProcessedImagesUpload} />
        )}
        {loadingImages && (
          <h3>Loading Images</h3>
        )}
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
        selectedCat={setSelectedCategory}
        passCat={selectedCategory} // pass data for editing existing product
        selectedSubCat={setSelectedSubcategory}
        passSubCat={selectedSubCategory}
        selectedSubSubCat={setSelectedSubSubcategory}
        passSubSubCat={selectedSubSubCategory}
        allowNewCats={allowNewCats}
        //onCategoriesLoaded={}
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
NewProd.propTypes = {
  productNameUserID: PropTypes.string.isRequired,
};
export default NewProd;
