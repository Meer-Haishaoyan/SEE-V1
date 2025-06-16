
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VoiceRecorderProps {
  onComplete: (text: string) => void;
  onBack: () => void;
}

const VoiceRecorder = ({ onComplete, onBack }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate real-time transcription
  useEffect(() => {
    if (isRecording) {
      const phrases = [
        "Had lunch with Sarah today...",
        "Had lunch with Sarah today, she helped me with...",
        "Had lunch with Sarah today, she helped me with the presentation and I paid for the meal...",
        "Had lunch with Sarah today, she helped me with the presentation and I paid for the meal, around 80 dollars total."
      ];
      
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < phrases.length) {
          setTranscription(phrases[currentIndex]);
          setAudioLevel(Math.random() * 100);
          currentIndex++;
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscription('');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const handleConfirm = () => {
    onComplete(transcription);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">Voice Input</h1>
        <div className="w-10"></div>
      </div>

      {/* Recording Interface */}
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div
              key="recording"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              {/* Microphone Button */}
              <motion.button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-lg ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-500 to-red-600' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
                
                {/* Audio Level Animation */}
                {isRecording && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-white"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>

              {/* Status Text */}
              <motion.p
                className="mt-6 text-lg font-medium text-gray-700"
                animate={{ opacity: isRecording ? [1, 0.5, 1] : 1 }}
                transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
              >
                {isRecording ? 'Listening...' : 'Tap to start recording'}
              </motion.p>

              {/* Real-time Transcription */}
              {transcription && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mt-8 max-w-md"
                >
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-gray-800 text-center">{transcription}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Control Buttons */}
              {transcription && !isRecording && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex space-x-4 mt-6"
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTranscription('');
                      setIsRecording(false);
                    }}
                  >
                    Try Again
                  </Button>
                  <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-lg font-medium text-gray-700">Processing with AI...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing interaction type and relationships</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceRecorder;
