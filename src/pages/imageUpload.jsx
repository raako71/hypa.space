import React, { useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

const ImageModification = ({ handleUpload }) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [processedImages, setProcessedImages] = useState({ scaled: [], unscaled: [] });

  const onDrop = (acceptedFiles) => {
    const maxImages = 10;
    if (acceptedFiles.length + previewImages.length > maxImages) {
      alert("You can only upload up to 10 images.");
      return;
    }
    setPreviewImages([...previewImages, ...acceptedFiles]);
  };

  const processImage = (index) => {
    const editor = editorsRef.current[index];
    if (editor) {
      const canvasScaled = editor.getImageScaledToCanvas();
      const canvasUnscaled = editor.getImage();
      
      setProcessedImages(prevState => ({
        scaled: [...prevState.scaled, canvasScaled.toDataURL()],
        unscaled: [...prevState.unscaled, canvasUnscaled.toDataURL()]
      }));

      // Remove the processed image from previewImages
      setPreviewImages(previewImages.filter((_, i) => i !== index));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const editorsRef = React.useRef([]);

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "1px dashed black",
          padding: "20px",
          cursor: "pointer",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag &apos;n&apos; drop some files here, or click to select files (up to 10 images)</p>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {previewImages.map((file, index) => (
          <div key={index} style={{ margin: "10px", width: "400px", height: "350px", overflow: "hidden", position: "relative" }}>
            <AvatarEditor
              ref={(editor) => (editorsRef.current[index] = editor)}
              image={file}
              width={400}
              height={400}
              border={50}
              color={[255, 255, 255, 0.6]}
              scale={1}
              rotate={0}
            />
            <button
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: "999",
              }}
              onClick={() => processImage(index)}
            >
              Process Image
            </button>
          </div>
        ))}
      </div>
      <div>
        <h3>Scaled Images</h3>
        {processedImages.scaled.map((image, index) => (
          <img key={index} src={image} alt={`Scaled Image ${index}`} style={{ margin: "10px", width: "350px" }} />
        ))}
        <h3>Unscaled Images</h3>
        {processedImages.unscaled.map((image, index) => (
          <img key={index} src={image} alt={`Unscaled Image ${index}`} style={{ margin: "10px", width: "300px" }} />
        ))}
      </div>
    </div>
  );
};

ImageModification.propTypes = {
  handleUpload: PropTypes.func.isRequired, // handleUpload prop is a function and is required
};

export default ImageModification;
