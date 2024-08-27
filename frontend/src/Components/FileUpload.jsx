import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [preview, setPreview] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleFile = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
        } else {
            setPreview("");
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();

        if (!file || !name || !email) {
            console.log("All fields are required.");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('name', name);
        formData.append('email', email);

        axios.post('http://localhost:8081/upload', formData)
            .then(res => {
                if (res.data.Status === "Success") {
                    setSuccessMessage("Upload succeeded!");
                    setTimeout(() => {
                        resetForm();
                    }, 3000);
                } else {
                    console.log("Upload failed");
                }
            })
            .catch(err => console.log(err));
    };

    const resetForm = () => {
        setFile(null);
        setName("");
        setEmail("");
        setPreview("");
        setSuccessMessage("");
        document.getElementById("image").value = ""; // Reset the file input manually
    };

    return (
        <div className="form-container">
            <h2>Upload Your Details</h2>
            {successMessage && (
                <div className="success-alert">
                    {successMessage}
                </div>
            )}
            <form onSubmit={handleUpload} className="upload-form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Upload Image</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleFile}
                        className="form-input"
                        required
                    />
                </div>
                {preview && (
                    <div className="preview-container">
                        <img src={preview} alt="Preview" className="preview-image" />
                    </div>
                )}
                <button type="submit" className="submit-button">
                    Upload
                </button>
            </form>
        </div>
    );
};

export default FileUpload;
