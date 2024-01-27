import React, { useState,useEffect } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

const ImageModification = ({ handleProcessedImagesUpload }) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [processedImages, setProcessedImages] = useState({ scaled: [], unscaled: [] });

  const passImages = async () => {
    handleProcessedImagesUpload(processedImages);
  };
  
  const onDrop = (acceptedFiles) => {
    const maxImages = 10;
    if (acceptedFiles.length + previewImages.length > maxImages) {
      alert("You can only upload up to 10 images.");
      return;
    }
    setPreviewImages([...previewImages, ...acceptedFiles]);
  };

  const processImage = async (index) => {
    const editor = editorsRef.current[index];
    if (editor) {
      const canvasScaledSmall = editor.getImageScaledToCanvas();
      const canvasUnscaled = editor.getImage();
      const canvasUnscaledMax1000 = await scaleImage(canvasUnscaled, 1000);
  
      setProcessedImages(prevState => {
        const scaledImages = prevState.scaled.length < 10 ? [...prevState.scaled, canvasScaledSmall.toDataURL()] : prevState.scaled;
        const unscaledImages = prevState.unscaled.length < 10 ? [...prevState.unscaled, canvasUnscaledMax1000.toDataURL()] : prevState.unscaled;
  
        return {
          scaled: scaledImages,
          unscaled: unscaledImages
        };
      });
  
      // Remove the processed image from previewImages
      setPreviewImages(previewImages.filter((_, i) => i !== index));
    }
  };
  
  
  useEffect(() => {
    passImages();
  }, [processedImages]);

  const scaleImage = (imageData, maxWidth) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scaleFactor = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.src = imageData.toDataURL();
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    acceptFunction: (file) => {
      console.log('Received file:', file);
    },
  });
  
  
  const editorsRef = React.useRef([]);

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "1px dashed black",
          padding: "20px",
          cursor: "pointer",
          margin: "8px 0",
          width: "350px",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag &apos;n&apos; drop some images here, or click to select files (up to 10 images)</p>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          textAlign:"center"
        }}
      >
        {previewImages.map((file, index) => (
          <div key={index} style={{ margin: "10px" }}>
            <AvatarEditor
              ref={(editor) => (editorsRef.current[index] = editor)}
              image={file}
              width={350}
              height={350}
              border={50}
              color={[255, 255, 255, 0.6]}
              scale={1}
              rotate={0}
            />
            <div>
              <button
                style={{
                  bottom: "10px",
                  left: "50%",
                }}
                onClick={() => processImage(index)}
              >
                Process Image
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ImageModification.propTypes = {
  handleProcessedImagesUpload: PropTypes.func.isRequired,
};

export default ImageModification;
