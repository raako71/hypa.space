import CategorySelector from "../components/categorySelector";
import Variations from "../components/variations";
import { useEffect, useState } from 'react';
import { auth, db } from "../firebase-config"
import { getFirestore, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore/lite';
import ImageModification from "../components/imageUpload";
import { getStorage, ref, uploadString, getDownloadURL, listAll } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import merge from 'lodash/merge';
import PropTypes from 'prop-types';

const NewProd = ({
  userID,
  existingData
}) => {
  const [productName, setProductName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [variations, setVariations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [passedImages, setPassedImages] = useState({ scaled: [], unscaled: [] });
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(''); // New state variable
  const [categories, setCategories] = useState([]);
  const allowNewCats = true;
  const navigate = useNavigate();
  const [productInfo, setProductInfo] = useState(null);
  const [productInfoLoaded, setProductInfoLoaded] = useState(false);
  const [imageCheck, setImageCheck] = useState(false);
  const [loadingImages, setloadingImages] = useState(false);
  const [deletingImages, setDeletingImages] = useState(false);
  const [loadedCats, setLoadedCats] = useState([]);
  const [productNameUserID, setProductNameUserID] = useState(null);
  //const [mergedCats, setMergedCats] = useState({});

  const getDataFromURL = (data) => {
    const params = new URLSearchParams(location.search);
    const productName = params.get(data);
    //console.log(productName);
    return productName;
  };

  useEffect(() => {
    setProductNameUserID(getDataFromURL('productName'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (productNameUserID != null) {
      getProductInfo(productNameUserID);
    }else setImageCheck(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productNameUserID]);


  const getProductInfo = async (productNameUserID) => {
    try {
      const firestore = getFirestore();
      const productDocRef = doc(firestore, 'products', productNameUserID);
      const productSnapshot = await getDoc(productDocRef);
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        setProductInfo(productData);
        setProductName(productData.productName);
        setProductDescription(productData.productDescription);
        setVariations(productData.variations || []); // Set variations if available
        // Set category information if available
        if (productData) {
          const [, userIDVar] = productNameUserID.split('_');
          indexImages(userIDVar, productData.images);
          setImageCheck(true);
        }

      } else {
        console.error('Product document not found.');
        window.location.assign(location.origin + "/newProduct");
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
      //setTimeout(() => handleReload(), 3000);
    }
  };

  const handleCategoriesLoaded = (productInfo) => {
    if (productInfo != null) {
      if (productInfo.category && Object.keys(productInfo.category).length > 0) {
        const categories = Object.keys(productInfo.category);
        const categoryName = categories[0];
        setSelectedCategory(categoryName);
        const subcategories = productInfo.category[categoryName];
        let loadedCats = [categoryName];
        //console.log('Subcategories:', subcategories);
        if (subcategories) {
          const subcategoryKeys = Object.keys(subcategories).filter(key => key !== 'name');
          if (subcategoryKeys.length > 0) {
            const subcategoryName = subcategoryKeys[0];
            loadedCats.push(subcategoryName);
            //console.log('Selected Subcat:', subcategoryName);
            setSelectedSubCategory(subcategoryName);
            const subSubcategories = subcategories[subcategoryName];
            if (subSubcategories) {
              const subSubcategoryKeys = Object.keys(subSubcategories).filter(key => key !== 'name');
              if (subSubcategoryKeys.length > 0) {
                const subSubcategoryName = subSubcategoryKeys[0];
                loadedCats.push(subSubcategoryName);
                setSelectedSubSubCategory(subSubcategoryName);
              }

            }
            setLoadedCats(loadedCats);
          }
        }
      } else {
        console.log('Category data not found or empty.');
      }
    } else {
      console.log('No data found.');
    }
  };

  useEffect(() => {
    if (productInfoLoaded && productInfo !== null) {
      handleCategoriesLoaded(productInfo);
    }
  }, [productInfoLoaded, productInfo]);


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
      if (containsHarmfulContent(newName, 1)) {
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

  const containsHarmfulContent = (description, name) => {
    let harmfulPatterns = /[^0-9a-zA-Z\s._-]/;
    if (name) harmfulPatterns = /[^0-9a-zA-Z\s_-]/;
    return harmfulPatterns.test(description);
  };

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

  const pruneTrees = async (mergedProductTree, returnedCategoryTree, test) => {
    const updatedProductTree = removeProductAndCleanup(mergedProductTree);
    //console.log("updatedProductTree: " + JSON.stringify(updatedProductTree, null, 2));
    const categoryTree = pruneCategoryTree(returnedCategoryTree, updatedProductTree)
    //console.log("returnedCategoryTree: " + JSON.stringify(categoryTree, null, 2));
    const userDocRef = doc(db, 'users', userID);
    if (!test) await updateDoc(userDocRef, { productTree: mergedProductTree, categoryTree: categoryTree });
  };

  function removeProductAndCleanup(mergedProductTree) {
    let currentLevel = mergedProductTree;

    // Traverse to the specified location
    for (let i = 0; i < loadedCats.length; i++) {
      if (!currentLevel[loadedCats[i]]) {
        // If the path does not exist, nothing to remove
        return mergedProductTree;
      }
      currentLevel = currentLevel[loadedCats[i]];
    }

    // Remove the product
    if (currentLevel.products && currentLevel.products[productNameUserID]) {
      delete currentLevel.products[productNameUserID];
    }

    // Function to clean up empty objects
    function cleanUpEmptyObjects(currentLevel, loadedCats, index) {
      if (index < 0) {
        return;
      }

      let key = loadedCats[index];
      let parentLevel = mergedProductTree;

      // Traverse to the parent level
      for (let i = 0; i < index; i++) {
        parentLevel = parentLevel[loadedCats[i]];
      }

      // Remove empty products object
      if (currentLevel.products && Object.keys(currentLevel.products).length === 0) {
        delete currentLevel.products;
      }

      // Remove empty category/subcategory/subsubcategory
      if (Object.keys(currentLevel).length === 0) {
        delete parentLevel[key];
        cleanUpEmptyObjects(parentLevel, loadedCats, index - 1);
      }
    }

    cleanUpEmptyObjects(currentLevel, loadedCats, loadedCats.length - 1);
    return mergedProductTree;
  }

  function pruneCategoryTree(categoryTree, updatedProductTree) {
    function traverseAndUpdate(categoryNode, productNode) {
      for (let key in productNode) {
        if (!categoryNode[key]) {
          // If the category or subcategory does not exist in the category tree, create it
          categoryNode[key] = { name: key };
        }

        if (!productNode[key].products) {
          // If there are subcategories, traverse recursively
          traverseAndUpdate(categoryNode[key], productNode[key]);
        }
      }

      // Clean up any empty categories
      for (let key in categoryNode) {
        if (!productNode[key]) {
          if (key != "name") {
            delete categoryNode[key];
          }
        }
      }
    }

    traverseAndUpdate(categoryTree, updatedProductTree);
    return categoryTree;
  }

  const updateCategoryTree = async () => {
    // Merge current with existing
    try {
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
      return mergedCategoryTree;
    } catch (error) {
      console.error('Error updating categoryTree in user file:', error);
      throw error; // Rethrow the error to handle it in the main function
    }
  };

  const uploadImages = async () => {
    try {
      // Upload images
      // Strings not required?!?
      //const storage = getStorage();
      //const userDirectoryRef = ref(storage, `users/${userID}`);
      //await uploadString(userDirectoryRef, '');
      const productNameWithoutSpaces = productName.replace(/\s+/g, '');
      const productDocumentName = `${productNameWithoutSpaces}_${userID}`;
      //const productDirectoryRef = ref(storage, `users/${userID}/${productDocumentName}`);
      //await uploadString(productDirectoryRef, '');
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

  // eslint-disable-next-line no-unused-vars
  const testPrune = async () => {
    const returnedCategoryTree = await updateCategoryTree();
    await updateUserDoc(returnedCategoryTree, 1);
  }

  const updateUserDoc = async (returnedCategoryTree, test) => {
    const existingproductTree = existingData?.productTree || {};
    const productNameWithoutSpaces = productName.replace(/\s+/g, '');
    const productDocumentName = `${productNameWithoutSpaces}_${userID}`;
    try {
      const userDocRef = doc(db, 'users', userID);
      //const userDocSnapshot = await getDoc(userDocRef);
      //const existingData = userDocSnapshot.data();
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
      let mergedProductTree = merge({}, existingproductTree, productTreeUpdate)
      let newProdTree = 0;
      if (loadedCats[2]) {
        console.log("Prev SubSubcategory Exists");
        if (selectedSubSubCategory !== loadedCats[2]) {
          newProdTree = 1;
          console.log("SubSubcategory modified")
        }
      }
      else if (loadedCats[1]) {
        if (selectedSubSubCategory) {
          newProdTree = 1;
          console.log("new SubSubcategory");
        }
        else {
          console.log("Prev Subcategory Exists");
        }
        if (selectedSubCategory !== loadedCats[1]) {
          newProdTree = 1;
          console.log("Subcategory modified")
        }
      } else {
        newProdTree = 1;
        console.log("New Product")
      }
      //console.log("mergedProductTree:", JSON.stringify(mergedProductTree, null, 2));
      if (newProdTree === 1) {
        if (Object.keys(existingproductTree).length > 0) {
          console.log("Removing prevoius product category");
          await pruneTrees(mergedProductTree, returnedCategoryTree, test);
        }
        else {
          if (!test) await updateDoc(userDocRef, { productTree: mergedProductTree, categoryTree: returnedCategoryTree });
        }
      }
    } catch (error) {
      console.error('Error updating Categories in user file:', error);
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
      const docSnapshot = await getDoc(userProductRef);
      const productData = {
        productName,
        productDescription,
        variations,
        category: categoryUpdate,
        userId: userID,
        images: passedImages.scaled.length > 0
      };
      if (docSnapshot.exists()) {
        console.log('Product exists!');
        // Ask for confirmation before updating
        const shouldUpdate = window.confirm('Confirm overwriting existing product?');
        if (shouldUpdate) {
          // If the user confirms, update the document
          await updateDoc(userProductRef, productData);
          const returnedCategoryTree = await updateCategoryTree();
          await updateUserDoc(returnedCategoryTree);
          await uploadImages();
          console.log('Product updated successfully!');
          return navigate(`/product?productName=${productDocumentName}`);
        } else {
          console.log('Update cancelled by user.');
        }
      } else {
        // If the document doesn't exist, create a new one
        await setDoc(userProductRef, productData);
        const returnedCategoryTree = await updateCategoryTree();
        await updateUserDoc(returnedCategoryTree);
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

  const removeLocalImages = () => {
    const invalidScaled = passedImages.scaled.filter(imageURL => !isValidDataUrl(imageURL));
    const invalidUnscaled = passedImages.unscaled.filter(imageURL => !isValidDataUrl(imageURL));
    setPassedImages({
      scaled: invalidScaled,
      unscaled: invalidUnscaled
    });
  };

  const deleteImagesFunc = async () => {
    const confirmAction = window.confirm("Confirm action?");
    removeLocalImages();
    if (confirmAction && passedImages.scaled.length > 0) {
      setDeletingImages(true);
      const basePath = `users/${userID}/${productNameUserID}`;
      try {
        await deleteFiles(basePath); // Wait for deletion to complete
        setPassedImages({ scaled: [], unscaled: [] });
        const userProductRef = doc(db, 'products', productNameUserID);
        await updateDoc(userProductRef, { images: false });
        setDeletingImages(false); // Set button to "running" state
      } catch (error) {
        console.error("Failed to delete images:", error);
        // Handle error, e.g., show error message to user
      }
    }
  };


  const deleteFiles = async (path) => {
    try {
      const user = auth.currentUser;
      const idToken = await user.getIdToken();
      const url = 'https://us-central1-hypa-space.cloudfunctions.net/deleteFiles';
      const bodyData = {
        path: path,
      };
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(bodyData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return true;
        })
        .then(data => {
          console.log('Response from Cloud Delete Function:', data);
        })
        .catch(error => {
          console.error('Error calling Cloud Function:', error);
        });
    } catch (error) {
      console.error('Error:', error);
    }
  }


  return (
    <div style={{ display: "flex", flexDirection: "column", padding: '25px' }}>
      <h1>Add New Product</h1>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
        <label htmlFor="productName" style={{ margin: "8px" }}>Product Name:</label>
        {!existingData && (<input
          type="text"
          id="productName"
          value={productName}
          onChange={handleProductNameChange}
        />
        )}
        {existingData && (<p>{productName}</p>
        )}
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
      {!saving && passedImages.scaled.length > 0 && productNameUserID && (
        <button style={{ margin: "10px", width: "200px" }} onClick={deleteImagesFunc} disabled={deletingImages}>
          {deletingImages ? "Deleting..." : "Delete Images"}
        </button>
      )}

      <Variations variations={variations} setVariations={setVariations} />

      <CategorySelector
        existingData={existingData}
        userID={userID}
        sendCategories={setCategories} // categories are store in parent state.
        selectedCategory={selectedCategory} // pass category for existing product
        setSelectedCategory={setSelectedCategory}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        selectedSubSubCategory={selectedSubSubCategory}
        setSelectedSubSubCategory={setSelectedSubSubCategory}
        allowNewCats={allowNewCats}
        onCategoriesLoaded={() => setProductInfoLoaded(true)}
      />
      <div style={{ display: "flex", alignItems: "center", margin: "8px" }}>
        {!saving && (
          <button onClick={handleSaveProduct} style={{ width: 'fit-content', margin: "8px" }}>Save Product</button>
        )}
        {saving && (
          <button style={{ width: 'fit-content', margin: "8px" }} disabled>Saving...</button>
        )}
        {errorMessage && (
          <p style={{ color: 'red', marginLeft: '8px' }}>{errorMessage}</p>
        )}
      </div>
      {/*
      <button onClick={testPrune} style={{ width: 'fit-content', margin: "8px" }}>Prune</button>
      */}
    </div>
  );
};
NewProd.propTypes = {
  userID: PropTypes.string,
  existingData: PropTypes.object
};
export default NewProd;
