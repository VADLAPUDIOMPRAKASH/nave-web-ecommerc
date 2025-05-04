import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { imgDB } from '../../../firebase/FirebaseConfig';

function ImageUploader({ folder, onUploadComplete }) {
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!imageFile) {
            alert("Please select an image file to upload.");
            return;
        }

        const imageRef = ref(imgDB, `${folder}/${imageFile.name}`);

        try {
            setUploading(true);
            await uploadBytes(imageRef, imageFile);
            const downloadUrl = await getDownloadURL(imageRef);
            alert("Image uploaded successfully.");
            onUploadComplete(downloadUrl); // Notify parent component
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className='flex flex-col items-center'>
            <input type="file" onChange={handleFileChange} />
            <button
                onClick={handleUpload}
                className='bg-blue-500 text-white font-bold px-4 py-2 rounded-lg mt-2'
                disabled={uploading}
            >
                {uploading ? "Uploading..." : "Upload Image"}
            </button>
        </div>
    );
}

export default ImageUploader;
