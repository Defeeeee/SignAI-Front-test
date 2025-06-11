import React, { useState, useRef, useCallback } from 'react';
import { Camera, Square, Play, Loader2, CheckCircle, AlertCircle, X, Copy, Zap } from 'lucide-react';

interface CameraCaptureProps {
  onClose: () => void;
}

interface TranslationResult {
  prediction: string;
  confidence?: number;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'dzonya1wx'; // Replace with your Cloudinary cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'signai'; // Replace with your upload preset

  // Define a function to stop tracks without dependencies
  const stopTracks = (mediaStream: MediaStream) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  };

  // Define stopCamera without dependencies on startCamera
  const stopCamera = useCallback(() => {
    if (stream) {
      stopTracks(stream);
      setStream(null);

      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream first to prevent conflicts
      if (stream) {
        stopTracks(stream);
        // Don't call stopCamera() here to avoid circular dependency
      }

      // Request camera access with more flexible constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      // Set stream state
      setStream(mediaStream);

      if (videoRef.current) {
        // Clear any previous sources
        videoRef.current.srcObject = null;

        // Set the new stream
        videoRef.current.srcObject = mediaStream;

        // Add event listeners for better error handling
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error('Error playing video:', e);
              setError('Failed to play video stream. Please refresh and try again.');
            });
          }
        };

        videoRef.current.onerror = () => {
          setError('Video playback error. Please refresh and try again.');
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Failed to access camera. Please ensure you have granted camera permissions.');
    }
  }, [stream]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    recordedChunksRef.current = [];

    // Try to use a more widely supported codec, with fallbacks
    let options = {};
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        options = { mimeType };
        break;
      }
    }

    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo(videoUrl);
      // Store the blob for later use
      recordedChunksRef.current = [blob];
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
    }
  }, [isRecording, stopCamera]);

  const uploadVideo = async (videoBlob: Blob) => {
    setUploading(true);
    setError(null);

    try {
      // Convert blob to file
      const file = new File([videoBlob], 'recorded-video.webm', { type: 'video/webm' });

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

      setUploading(false);
      setRecordedVideo(videoUrl);

      return videoUrl;
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : 'Upload failed. Please check your Cloudinary configuration.');
      return null;
    }
  };

  const processVideo = async (videoUrl: string) => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `https://signai.fdiaznem.com.ar/predict?video_url=${encodeURIComponent(videoUrl)}`,
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

  // Add a ref to track reset in progress
  const isResettingRef = useRef(false);

  const resetCapture = useCallback(async () => {
    // Prevent multiple simultaneous resets
    if (isResettingRef.current) return;
    isResettingRef.current = true;

    // Reset all states
    setRecordedVideo(null);
    setTranslationResult(null);
    setError(null);
    setUploading(false);
    setProcessing(false);
    setCopied(false);

    // Clear recorded chunks
    recordedChunksRef.current = [];

    // Stop current stream if exists
    if (stream) {
      stopTracks(stream);
    }

    // Set stream to null to show loading indicator
    setStream(null);

    // Reinitialize camera with a small delay to ensure clean restart
    setTimeout(async () => {
      try {
        await startCamera();
        // The video will automatically transition in with opacity
        // due to the stream state change and onCanPlay handler
      } catch (err) {
        console.error('Camera reset error:', err);
        setError('Failed to restart camera. Please refresh and try again.');
      } finally {
        // Reset the flag when done, regardless of success or failure
        isResettingRef.current = false;
      }
    }, 500); // Slightly longer delay for smoother transition
  }, [stream, startCamera]);

  const handleTranslate = async () => {
    if (recordedChunksRef.current.length === 0) return;

    const blob = recordedChunksRef.current[0];
    const videoUrl = await uploadVideo(blob);

    // If we have a video URL from Cloudinary, process it
    if (videoUrl) {
      // Update the video element to use the Cloudinary URL
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
        videoRef.current.load();
      }

      await processVideo(videoUrl);
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

  // Initialize camera when component mounts - use ref to prevent multiple initializations
  const hasInitializedRef = useRef(false);

  React.useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      // Only initialize once
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      try {
        // Start with loading state
        if (mounted) {
          // Stream is already null by default, which will show the loading indicator

          // Small delay before starting camera to ensure loading indicator is visible
          setTimeout(async () => {
            if (mounted) {
              await startCamera();
              // The video will automatically transition in with opacity
              // due to the stream state change and onCanPlay handler
            }
          }, 300);
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        if (mounted) {
          setError('Failed to initialize camera. Please refresh and try again.');
          hasInitializedRef.current = false; // Allow retry on error
        }
      }
    };

    // Initialize camera
    initCamera();

    // Cleanup function
    return () => {
      mounted = false;
      if (stream) {
        stopTracks(stream);
        setStream(null);
      }
    };
  }, []); // Empty dependency array to ensure it only runs once

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Record Sign Language</h2>
            <p className="text-gray-600 mt-1">Record your sign language video, then translate it with our AI</p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {!recordedVideo && (
            <div className="space-y-6">
              {/* Camera View */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  width="100%"
                  height="auto"
                  className="w-full aspect-video object-cover bg-black relative z-0"
                  style={{ 
                    minHeight: "300px",
                    transform: "scaleX(1)", // Ensure correct orientation
                    opacity: stream ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out"
                  }}
                  onCanPlay={() => {
                    // Ensure video is visible and playing when it can play
                    if (videoRef.current) {
                      videoRef.current.style.opacity = "1";
                      videoRef.current.play().catch(e => {
                        console.error('Error playing video on canplay event:', e);
                      });
                    }
                  }}
                />

                {/* Fallback when camera is initializing or has errors */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black z-10 transition-opacity duration-300 ${stream ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                  <p className="text-white ml-3">Initializing camera...</p>
                </div>

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                )}

                {/* Recording Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={!stream}
                      className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white p-4 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera className="w-8 h-8" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Square className="w-8 h-8" />
                    </button>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
                <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside mb-4">
                  <li>Record your sign language video using the camera</li>
                  <li>Review your recording to ensure it's clear</li>
                  <li>Click "Translate Now" to process with our AI</li>
                  <li>View and copy your translation results</li>
                </ol>
                <h3 className="font-semibold text-blue-900 mb-2">Recording Tips</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Ensure good lighting and clear visibility of your hands</li>
                  <li>• Position yourself so your upper body and hands are fully visible</li>
                  <li>• Sign at a normal pace for best recognition results</li>
                  <li>• Keep the recording between 3-30 seconds for optimal processing</li>
                </ul>
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white p-4 rounded-full w-fit mx-auto mb-6">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Uploading your recording...
              </h3>
              <p className="text-gray-600">
                Please wait while we securely upload your video to the cloud
              </p>
            </div>
          )}

          {recordedVideo && (
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Play className="w-5 h-5 text-[#FF7A00]" />
                  <span>Your Recording</span>
                </h3>
                <video
                  src={recordedVideo}
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
                      <h4 className="font-semibold text-blue-900">Processing Recording with AI</h4>
                      <p className="text-blue-700">Our advanced AI is analyzing the sign language in your recording...</p>
                    </div>
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
                              "{translationResult.prediction}"
                            </p>
                            {translationResult.confidence && (
                              <p className="text-sm text-gray-600 mt-3">
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
                  onClick={resetCapture}
                  className="px-6 py-3 border-2 border-[#FF7A00] text-[#FF7A00] rounded-full font-semibold hover:bg-[#FF7A00] hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Record Another</span>
                </button>
                {!translationResult && !processing && !uploading && (
                  <button
                    onClick={handleTranslate}
                    className="px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Translate Now</span>
                  </button>
                )}
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
                  <button
                    onClick={resetCapture}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
