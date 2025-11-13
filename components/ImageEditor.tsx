import React, { useState } from 'react';
import { analyzeImageWithGemini } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const MODELS = {
  AlexNet: "Pioneered the use of deep convolutional neural networks for image classification. Known for using ReLU activation and dropout layers. A foundational model.",
  VGG: "Features a very simple and uniform architecture, using small 3x3 convolution filters stacked on top of each other. Good for feature extraction but computationally expensive.",
  ResNet: "Introduced 'residual blocks' or skip connections to train extremely deep networks (hundreds of layers) without performance degradation, excelling at complex recognition tasks.",
  Inception: "Also known as GoogLeNet, it uses 'Inception modules' that perform multiple different convolutions in parallel, capturing features at various scales efficiently.",
  EfficientNet: "A modern architecture that uniformly scales model depth, width, and resolution using a compound coefficient. It achieves high accuracy with fewer parameters and faster computation."
};

type ModelName = keyof typeof MODELS;


const ImageEditor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelName>('ResNet');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setOriginalImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null);
      setAnalysisError(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile || !imagePrompt.trim()) {
      setAnalysisError("Please upload an image and provide a question or prompt.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const base64Data = await fileToBase64(imageFile);
      const analysisPrompt = `Acting as a computer vision expert, analyze the provided image from the perspective of the ${selectedModel} CNN model.
      
First, provide a one-sentence summary of the ${selectedModel} architecture's main strength.
      
Then, based on the image, answer the user's question: "${imagePrompt}"`;

      const resultText = await analyzeImageWithGemini(base64Data, imageFile.type, analysisPrompt);
      setAnalysisResult(resultText);
    } catch (error) {
      console.error(error);
      setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-6 p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-600 pb-3">DLIA Project: Image Analytics Demo</h2>
      <p className="text-gray-400 mb-6">This tool showcases advanced image analysis. Upload an image, select a classic CNN model to simulate its perspective, and ask a question. This demo is inspired by SIH 2025 and uses a powerful multimodal AI to generate the analysis.</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Input Column */}
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="image-upload" className="block mb-2 text-sm font-medium text-gray-300">1. Upload Image</label>
            <input 
              id="image-upload"
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isAnalyzing}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
            />
          </div>
          
          {originalImagePreview && (
            <div className="mt-2 text-center">
              <img src={originalImagePreview} alt="Original preview" className="rounded-lg max-h-48 w-auto inline-block shadow-md" />
            </div>
          )}
          
          <div className="mt-2">
            <label htmlFor="model-select" className="block mb-2 text-sm font-medium text-gray-300">2. Select CNN Model</label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelName)}
              disabled={isAnalyzing}
              className="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              {Object.keys(MODELS).map(modelName => (
                <option key={modelName} value={modelName}>{modelName}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2 p-2 bg-gray-900 rounded-md">{MODELS[selectedModel]}</p>
          </div>

          <div>
            <label htmlFor="image-prompt" className="block mb-2 text-sm font-medium text-gray-300">3. Ask a question about the image</label>
            <input
              id="image-prompt"
              type="text"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="e.g., 'What is in this image?'"
              disabled={isAnalyzing}
              className="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleAnalyzeImage}
            disabled={isAnalyzing || !imageFile || !imagePrompt.trim()}
            className="w-full px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </button>
        </div>

        {/* Output Column */}
        <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg p-4 min-h-[250px] border border-dashed border-gray-600">
          {isAnalyzing && (
             <div className="text-center text-gray-400">
                <div className="w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-full animate-spin mx-auto mb-2"></div>
                Analyzing your image, please wait...
             </div>
          )}
          {!isAnalyzing && analysisResult && (
            <div className="text-gray-300 text-sm whitespace-pre-wrap w-full text-left overflow-y-auto max-h-72 p-2">
              <p>{analysisResult}</p>
            </div>
          )}
          {!isAnalyzing && !analysisResult && (
             <p className="text-gray-500 text-center">Your analysis result will appear here.</p>
          )}
        </div>
      </div>
      {analysisError && <p className="text-red-400 mt-4 text-center">{analysisError}</p>}
    </div>
  );
};

export default ImageEditor;
