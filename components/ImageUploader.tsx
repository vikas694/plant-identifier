'use client'

import { useState, ChangeEvent, FormEvent, useRef } from 'react'
import Image from 'next/image'

interface ImageUploaderProps {
  onImageUpload: (file: File) => void
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleTakePhoto = () => {
    cameraInputRef.current?.click()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (file) {
      onImageUpload(file)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            ref={fileInputRef}
            className="hidden"
          />
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            onChange={handleImageChange} 
            ref={cameraInputRef}
            className="hidden"
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-plant-green-500 hover:bg-plant-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out"
          >
            Upload Image
          </button>
          <button 
            type="button"
            onClick={handleTakePhoto}
            className="flex-1 bg-plant-green-700 hover:bg-plant-green-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out"
          >
            Take Photo
          </button>
        </div>

        {selectedImage && (
          <div className="mt-4 flex justify-center relative">
            <Image 
              src={selectedImage} 
              alt="Selected plant" 
              width={300} 
              height={300} 
              className="rounded-lg object-cover max-h-64 shadow-md"
            />
            <button 
              type="button"
              onClick={() => {
                setSelectedImage(null)
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
                if (cameraInputRef.current) cameraInputRef.current.value = ''
              }}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all duration-300"
            >
              ✕
            </button>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!file}
          className="upload-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Identify Plant
        </button>
      </form>
    </div>
  )
}