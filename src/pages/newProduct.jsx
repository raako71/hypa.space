import CategorySelector from "./categorySelector";
import Variations from "./variations";
import { useEffect, useState } from 'react';

const NewProd = () => {
  const [productName, setProductName] = useState("");
  const [productNameError, setProductNameError] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productDescriptionError, setProductDescriptionError] = useState("");
  const [variations, setVariations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const handleProductDescriptionChange = (event) => {
    const newDescription = event.target.value;
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

  const handlePrintToConsole = () => {
    console.log("Document:", {
      productName,
      productDescription,
      variations,
      selectedCategory,
      selectedSubcategory,
      // Include other relevant data
    });
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
      />

      <button onClick={handlePrintToConsole}>Print Product to Console</button>
    </div>
  );
};

export default NewProd;