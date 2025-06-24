import React, { useState, useRef } from 'react';
import { Upload, Camera, Play, Loader2, CheckCircle, AlertCircle, X, Copy } from 'lucide-react';

interface VideoUploadProps {
  onClose: () => void;
}

interface TranslationResult {
  prediction: string;
  confidence?: number;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cloudinary configuration - Replace with your actual values
  const CLOUDINARY_CLOUD_NAME = 'dzonya1wx'; // Replace with your Cloudinary cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'signai'; // Replace with your upload preset

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'video');

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error('Failed to upload video to Cloudinary');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const videoUrl = cloudinaryData.secure_url;

      setUploadedVideo(videoUrl);
      setUploading(false);

      // Process with AI
      await processVideo(videoUrl);

    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : 'Upload failed. Please check your Cloudinary configuration.');
    }
  };

  const processVideo = async (videoUrl: string) => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `https://signai.fdiaznem.com.ar/predict_gemini?video_url=${encodeURIComponent(videoUrl)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`AI processing failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setTranslationResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadedVideo(null);
    setTranslationResult(null);
    setError(null);
    setUploading(false);
    setProcessing(false);
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = async () => {
    if (translationResult?.prediction) {
      try {
        await navigator.clipboard.writeText(translationResult.prediction);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Video for Translation</h2>
            <p className="text-gray-600 mt-1">Upload your sign language video and get instant AI-powered translation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {!uploadedVideo && !uploading && (
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-[#FF7A00] bg-[#FF7A00]/5'
                  : 'border-gray-300 hover:border-[#FF7A00] hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white p-4 rounded-full w-fit mx-auto">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Drop your video here or click to browse
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Supports MP4, MOV, AVI, WebM, and other common video formats
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum file size: 100MB • Best results with clear sign language videos
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Choose File
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white p-4 rounded-full w-fit mx-auto mb-6">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Uploading your video...
              </h3>
              <p className="text-gray-600">
                Please wait while we securely upload your video to the cloud
              </p>
              <div className="mt-4 w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {uploadedVideo && (
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Play className="w-5 h-5 text-[#FF7A00]" />
                  <span>Video Preview</span>
                </h3>
                <video
                  ref={videoRef}
                  src={uploadedVideo}
                  controls
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg bg-black"
                  style={{ maxHeight: '400px' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Processing Status */}
              {processing && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Processing Video with AI</h4>
                      <p className="text-blue-700">Our advanced AI is analyzing the sign language in your video. This may take a few moments...</p>
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}

              {/* Translation Result */}
              {translationResult && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 mb-3">Translation Complete!</h4>
                      <div className="bg-white rounded-lg p-6 border border-green-200 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-lg text-gray-900 leading-relaxed font-medium">
                              "{translationResult.translation}"
                            </p>
                            {translationResult.confidence && (
                              <p className="text-sm text-gray-600 mt-3 flex items-center space-x-2">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {Math.round(translationResult.confidence * 100)}% Confidence
                                </span>
                              </p>
                            )}
                          </div>
                          <button
                            onClick={copyToClipboard}
                            className="ml-4 p-2 text-gray-500 hover:text-[#FF7A00] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy translation"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      {copied && (
                        <p className="text-sm text-green-600 mt-2 flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Copied to clipboard!</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border-2 border-[#FF7A00] text-[#FF7A00] rounded-full font-semibold hover:bg-[#FF7A00] hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Another Video</span>
                </button>
                {translationResult && (
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Copy className="w-5 h-5" />
                    <span>{copied ? 'Copied!' : 'Copy Translation'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">Something went wrong</h4>
                  <p className="text-red-700 mb-4">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={resetUpload}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                    {error.includes('Cloudinary') && (
                      <p className="text-sm text-red-600 self-center">
                        Please configure your Cloudinary settings in the VideoUpload component
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
