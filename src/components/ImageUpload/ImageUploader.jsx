import React, { useState, useRef } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDER } from "../../graphql/queries/order.query";
import axios from "axios";
import toast from "react-hot-toast";
import { baseURL } from "../../utils/apiConfig";

const ImageUploader = ({ orderId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { refetch } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Faqat rasmlarni yuklashingiz mumkin (jpg, png, gif, webp)");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Rasm hajmi 5MB dan kam bo'lishi kerak");
      return;
    }

    setIsUploading(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Send request to the REST API endpoint with full URL
      const response = await axios.post(
        `${baseURL}/api/upload-order-image/${orderId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Check if upload was successful
      if (response.status === 200) {
        toast.success("Rasm muvaffaqiyatli yuklandi");
        // Refetch order data to update UI
        refetch();
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Xatolik yuz berdi: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-700 border-gray-600 hover:bg-gray-600 ${
            isUploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-3 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold">Rasmni yuklash uchun bosing</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP (Max: 5MB)</p>
          </div>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
          />
        </label>
      </div>
      {isUploading && (
        <div className="mt-2 text-center text-sm text-gray-400">
          Rasm yuklanmoqda...
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
