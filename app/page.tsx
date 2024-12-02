'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GoogleGenerativeAI } from "@google/generative-ai"
import ImageUploader from '../components/ImageUploader'
import { SunIcon, WaterDropIcon, SoilIcon, MedicineIcon, ShieldIcon } from '../components/Icons'

interface PlantInfo {
  name: string
  description: string
  scientificName?: string
  careTips?: string
  medicinalValue?: string
  toxicity?: string
  sunlight?: string
  watering?: string
  soil?: string
}

export default function Home() {
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)

  const handleImageUpload = async (file: File) => {
    setIsLoading(true)
    setPlantInfo(null)
    setOriginalImage(URL.createObjectURL(file))

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1]

        const prompt = "Identify this plant. Provide the plant's name, a brief description, its scientific name, care tips, medicinal value, toxicity, sunlight, watering, and soil requirements. Ensure the response is clear and concise."

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [
            { text: prompt },
            { inlineData: { mimeType: file.type, data: base64Image } }
          ]}]
        })

        const response = result.response.text()

        const parsedInfo = parseGeminiResponse(response)

        setPlantInfo(parsedInfo)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Plant identification error:', error)
      setIsLoading(false)
    }
  }

  const parseGeminiResponse = (response: string): PlantInfo => {
    // Clean up the response to remove any unwanted asterisks or formatting
    const cleanedResponse = response.replace(/\*/g, '').trim()

    return {
      name: extractDetail(cleanedResponse, 'Name'),
      description: extractDetail(cleanedResponse, 'Description'),
      scientificName: extractDetail(cleanedResponse, 'Scientific Name'),
      careTips: extractDetail(cleanedResponse, 'Care Tips'),
      medicinalValue: extractDetail(cleanedResponse, 'Medicinal Value'),
      toxicity: extractDetail(cleanedResponse, 'Toxicity'),
      sunlight: extractDetail(cleanedResponse, 'Sunlight'),
      watering: extractDetail(cleanedResponse, 'Watering'),
      soil: extractDetail(cleanedResponse, 'Soil')
    }
  }

  const extractDetail = (text: string, label: string): string => {
    const regex = new RegExp(`${label}:?\\s*(.+?)(?=\\n|$)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : 'Information not available'
  }

  const downloadReport = () => {
    if (!plantInfo) return

    const reportContent = `
Plant Identification Report

Plant Name: ${plantInfo.name}
Scientific Name: ${plantInfo.scientificName || 'Not available'}

Description:
${plantInfo.description}

Care Details:
- Care Tips: ${plantInfo.careTips || 'Not available'}
- Sunlight: ${plantInfo.sunlight || 'Not available'}
- Watering: ${plantInfo.watering || 'Not available'}
- Soil: ${plantInfo.soil || 'Not available'}

Additional Information:
- Medicinal Value: ${plantInfo.medicinalValue || 'Not available'}
- Toxicity: ${plantInfo.toxicity || 'Not available'}

Report generated on: ${new Date().toLocaleString()}
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${plantInfo.name.replace(/\s+/g, '_')}_plant_report.txt`
    link.click()
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-plant-green-50 to-plant-green-100">
      <div className="container max-w-xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-plant-green-700 drop-shadow-md">
          Plant Identifier
        </h1>

        <ImageUploader onImageUpload={handleImageUpload} />

        {isLoading && (
          <div className="mt-8 text-center">
            <div className="animate-pulse text-plant-green-600">
              Identifying your plant...
            </div>
          </div>
        )}

        {plantInfo && (
          <div className="mt-8 bg-white shadow-2xl rounded-xl p-6 animate-fade-in relative">
            <div className="flex flex-col md:flex-row items-center mb-6">
              {originalImage && (
                <Image 
                  src={originalImage} 
                  alt="Uploaded plant" 
                  width={200} 
                  height={200} 
                  className="rounded-lg object-cover mr-6 mb-4 md:mb-0 shadow-md"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold mb-2 text-plant-green-700">
                  {plantInfo.name}
                </h2>
                {plantInfo.scientificName && (
                  <p className="text-gray-600 italic">
                    {plantInfo.scientificName}
                  </p>
                )}
              </div>
            </div>

            <p className="mb-4 text-gray-700">
              {plantInfo.description}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: <SunIcon />, label: 'Sunlight', value: plantInfo.sunlight },
                { icon: <WaterDropIcon />, label: 'Watering', value: plantInfo.watering },
                { icon: <SoilIcon />, label: 'Soil', value: plantInfo.soil },
                { icon: <MedicineIcon />, label: 'Medicinal Value', value: plantInfo.medicinalValue },
                { icon: <ShieldIcon />, label: 'Toxicity', value: plantInfo.toxicity },
              ].map((item, index) => (
                item.value && item.value !== 'Information not available' && (
                  <div key={index} className="bg-plant-green-50 p-4 rounded-lg flex items-center space-x-4">
                    <div className="text-plant-green-600">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-plant-green-700">{item.label}</h3>
                      <p className="text-gray-700">{item.value}</p>
                    </div>
                  </div>
                )
              ))}
            </div>

            {plantInfo.careTips && (
              <div className="mt-6 bg-plant-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-plant-green-700 mb-2">Care Tips</h3>
                <p className="text-gray-700">{plantInfo.careTips}</p>
              </div>
            )}

            <button 
              onClick={downloadReport}
              className="mt-6 w-full bg-plant-green-500 hover:bg-plant-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out"
            >
              Download Plant Report
            </button>
          </div>
        )}
      </div>
    </div>
  )
}