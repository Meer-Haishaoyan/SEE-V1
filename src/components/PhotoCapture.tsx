
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, ArrowLeft, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhotoCaptureProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

const PhotoCapture = ({ onComplete, onBack }: PhotoCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        processImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = () => {
    setIsProcessing(true);
    
    // Simulate AI processing of receipt
    setTimeout(() => {
      setExtractedData({
        type: 'Restaurant Receipt',
        date: '2024-06-14',
        venue: 'Golden Dragon Restaurant',
        totalAmount: 156.80,
        participants: ['You', 'Sarah Chen', 'Mike Johnson'],
        perPersonCost: 52.27,
        detectedItems: [
          'Kung Pao Chicken - $28.90',
          'Sweet & Sour Pork - $26.50',
          'Fried Rice - $18.90',
          'Tea (3 cups) - $9.00'
        ]
      });
      setIsProcessing(false);
    }, 2500);
  };

  const handleConfirm = () => {
    onComplete(extractedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">Photo Capture</h1>
        <div className="w-10"></div>
      </div>

      <AnimatePresence mode="wait">
        {!capturedImage ? (
          <motion.div
            key="capture"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            {/* Camera Interface */}
            <div className="relative w-80 h-60 bg-gray-200 rounded-xl overflow-hidden shadow-lg mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Position receipt in frame</p>
                </div>
              </div>
              
              {/* Guideline overlay */}
              <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg"></div>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture Receipt
            </Button>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageCapture}
              className="hidden"
            />
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            {/* Captured Image */}
            <div className="w-full max-w-md mx-auto">
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
            </div>

            {isProcessing ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-lg font-medium text-gray-700">Analyzing Receipt...</p>
                <p className="text-sm text-gray-500 mt-2">Extracting details and participants</p>
              </motion.div>
            ) : extractedData && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-4"
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Edit3 className="w-5 h-5 mr-2 text-green-600" />
                      Extracted Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="venue">Venue</Label>
                        <Input id="venue" defaultValue={extractedData.venue} />
                      </div>
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" defaultValue={extractedData.date} />
                      </div>
                      <div>
                        <Label htmlFor="total">Total Amount</Label>
                        <Input id="total" defaultValue={`$${extractedData.totalAmount}`} />
                      </div>
                      <div>
                        <Label htmlFor="perPerson">Per Person</Label>
                        <Input id="perPerson" defaultValue={`$${extractedData.perPersonCost}`} />
                      </div>
                    </div>

                    <div>
                      <Label>Participants</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {extractedData.participants.map((person: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {person}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Detected Items</Label>
                      <ul className="mt-2 space-y-1">
                        {extractedData.detectedItems.map((item: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCapturedImage(null);
                      setExtractedData(null);
                    }}
                    className="flex-1"
                  >
                    Retake Photo
                  </Button>
                  <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoCapture;
