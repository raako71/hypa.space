import  { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Variations = ({ variations: propVariations, setVariations }) => {
  const [variationName, setVariationName] = useState("");
  const [numVariationTypes, setNumVariationTypes] = useState(2);
  const [variationTypes, setVariationTypes] = useState(Array.from({ length: 2 }, () => ""));
  const [currentVariationError, setCurrentVariationError] = useState("");

  const handleVariationNameChange = (event) => {
    setVariationName(event.target.value);
  };

  useEffect(() => {
    setVariationTypes(Array.from({ length: numVariationTypes }, () => ""));
  }, [numVariationTypes]);

  const handleNumVariationTypesChange = (event) => {
    const numTypes = parseInt(event.target.value, 10);
    setNumVariationTypes(Math.max(2, numTypes));
    setVariationTypes(Array.from({ length: numTypes }, () => ""));
  };

  const handleVariationTypeChange = (index, event) => {
    const updatedVariationTypes = [...variationTypes];
    updatedVariationTypes[index] = event.target.value || "";
    setVariationTypes(updatedVariationTypes);
  };

  const handleAddVariation = () => {
    if (propVariations.length < 3) {
      const newVariation = {
        name: variationName,
        types: variationTypes.slice(0, numVariationTypes),
      };

      setVariations([...propVariations, newVariation]);
      setVariationName("");
      setNumVariationTypes(2);
      setVariationTypes(Array.from({ length: 2 }, () => ""));
      setCurrentVariationError("");
    } else {
      setCurrentVariationError("You can only add up to 3 variations.");
    }
  };

  const handleDeleteVariation = (index) => {
    const updatedVariations = [...propVariations];
    updatedVariations.splice(index, 1);
    setVariations(updatedVariations);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
        <label htmlFor="variationName" style={{ marginRight: "8px" }}>Variation Name:</label>
        <input
          type="text"
          id="variationName"
          value={variationName}
          onChange={handleVariationNameChange}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
        <label htmlFor="numVariationTypes" style={{ marginRight: "8px" }}>Number of Variation Types:</label>
        <select
          id="numVariationTypes"
          value={numVariationTypes}
          onChange={handleNumVariationTypesChange}
        >
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <div>
        {Array.from({ length: numVariationTypes }).map((_, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
            <label htmlFor={`variationType${index}`} style={{ marginRight: "8px" }}>Variation Type {index + 1}:</label>
            <input
              type="text"
              id={`variationType${index}`}
              value={variationTypes[index]}
              onChange={(event) => handleVariationTypeChange(index, event)}
            />
          </div>
        ))}
      </div>

      <button onClick={handleAddVariation} style={{ width: '150px' }}>Add Variation</button>
      {currentVariationError && <p className="error">{currentVariationError}</p>}

      {propVariations.map((variation, index) => (
        <div key={index} style={{ border: "1px solid #ccc", padding: "8px", width: 'fit-content', margin: "8px 0" }}>
          <p>Variation Name: {variation.name}</p>
          <p>Variation Types: {variation.types.join(', ')}</p>
          <button onClick={() => handleDeleteVariation(index)}>Delete Variation</button>
        </div>
      ))}
    </div>
  );
};

Variations.propTypes = {
  variations: PropTypes.array.isRequired,
  setVariations: PropTypes.func.isRequired,
};

export default Variations;
