import CategorySelector from "./categorySelector";
import Variations from "./variations";
import { useEffect, useState } from 'react';
import { auth, db } from "../firebase-config"
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore/lite';
import { onAuthStateChanged } from 'firebase/auth';
import ImageModification from "./imageUpload";
import { getStorage, ref, uploadString } from 'firebase/storage';

const NewProd = () => {
  const [productName, setProductName] = useState("");
  const [productNameError, setProductNameError] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productDescriptionError, setProductDescriptionError] = useState("");
  const [variations, setVariations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [userID, setUserID] = useState(null);
  const [passedImages, setPassedImages] = useState({ scaled: [], unscaled: [] });
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null); // New state variable


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




  const handleProductDescriptionChange = (event) => {
    const newDescription = event.target.value;
    // Check for potentially harmful content
    if (containsHarmfulContent(newDescription)) {
      throw new Error("Product description contains disallowed content.");
    }
    setProductDescription(newDescription);
    // Validate product description only if it's not empty
    if (newDescription.trim() !== '') {
      if (newDescription.length > 1000) {
        setProductDescriptionError("Product description should be 1000 characters or less.");
      } else {
        setProductDescriptionError("");
      }
    } else {
      // Clear the error message if the field is empty
      setProductDescriptionError("");
    }
  };

  const containsHarmfulContent = (description) => {
    const harmfulPatterns = /<\s*script|<\s*iframe|on\w+\s*=/i;
    return harmfulPatterns.test(description);
  };

  const handleProductNameChange = (event) => {
    event.persist(); // Persist the synthetic event

    const newName = event.target.value;
    setProductName(newName);

    // Validate product name
    if (newName.trim() !== '') {
      if (newName.length > 30) {
        setProductNameError("Product name should be 30 characters or less.");
      } else if (!/^[a-zA-Z0-9_-\s+]+$/.test(newName)) {
        setProductNameError("Product name should contain only letters, numbers, underscores, and hyphens.");
      } else {
        setProductNameError(""); // Clear the error when the name is valid
      }
    } else {
      setProductNameError("");
    }
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
    try {
      if (productNameError !== "") {
        throw new Error("Product name is invalid.");
      }

      // Update the user document with the category tree information
      const userDocRef = doc(db, 'users', userID);
      // Check if selectedSubSubcategory is null
      if (selectedSubSubcategory === "") {
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists() && !docSnapshot.data().categoryTree[selectedCategory][selectedSubcategory]) {
          await updateDoc(userDocRef, {
            [`categoryTree.${selectedCategory}.${selectedSubcategory}`]: true
          });
        }
      }
      else {
        await updateDoc(userDocRef, {
          categoryTree: {
            [selectedCategory]: {
              [selectedSubcategory]: {
                [selectedSubSubcategory]: true // Include selected sub-subcategory
              }
            }
          },
        });
      }


      // Create user directory and product subdirectory in Firebase Storage
      const storage = getStorage();
      const userDirectoryRef = ref(storage, `users/${userID}`);
      await uploadString(userDirectoryRef, '');

      // Define productDocumentName
      const productDocumentName = `${productName}_${userID}`;

      const productDirectoryRef = ref(storage, `users/${userID}/${productDocumentName}`);
      await uploadString(productDirectoryRef, '');

      try {
        // Upload images to the product directory
        await uploadImagesToStorage(passedImages, userID, productDocumentName);

        // Clear passedImages state after successful upload
        setPassedImages({ scaled: [], unscaled: [] });
      } catch (error) {
        console.error('Error uploading images:', error);
        // Handle error if upload fails
      }


      // Save product data
      const userProductRef = doc(db, 'products', productDocumentName);
      let category = {};

      // Check if selectedSubSubcategory is empty
      if (selectedSubSubcategory === "") {
        category = {
          [selectedCategory]: {
            [selectedSubcategory]: true
          }
        };
      } else {
        category = {
          [selectedCategory]: {
            [selectedSubcategory]: {
              [selectedSubSubcategory]: true
            }
          }
        };
      }

      const productData = {
        productName,
        productDescription,
        variations,
        category,
        userId: userID,
        // Include other relevant data
      };

      const docSnapshot = await getDoc(userProductRef);

      if (docSnapshot.exists()) {
        console.log('Product exists!');
        // Ask for confirmation before updating
        const shouldUpdate = window.confirm('A product with this name already exists. Do you want to update it?');

        if (shouldUpdate) {
          // If the user confirms, update the document
          await updateDoc(userProductRef, productData);
          console.log('Product updated successfully!');
        } else {
          console.log('Update cancelled by user.');
        }
      } else {
        // If the document doesn't exist, create a new one
        await setDoc(userProductRef, productData);
        console.log('Product saved successfully!');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
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
        {productNameError && <p className="error" style={{ marginLeft: "8px" }}>{productNameError}</p>}
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

        <div style={{ display: "flex", flexDirection: "column" }}>
          {productDescriptionError && (
            <p className="error" style={{ marginLeft: "8px", display: "block", order: 1 }}>
              {productDescriptionError}
            </p>
          )}
        </div>
      </div>

      <Variations variations={variations} setVariations={setVariations} />

      <CategorySelector
        setSelectedCategory={setSelectedCategory}
        setSelectedSubcategory={setSelectedSubcategory}
        setSelectedSubSubcategory={setSelectedSubSubcategory} // Pass down setSelectedSubSubcategory
      />

      <button onClick={handleSaveProduct} style={{ width: 'fit-content', margin: "8px" }} >Save</button>
    </div>
  );
};

export default NewProd;
