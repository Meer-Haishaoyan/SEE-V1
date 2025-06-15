import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Zap, MicOff, Check, Edit2, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import NetworkGraph from '@/components/NetworkGraph';
import ContactProfile from '@/components/ContactProfile';
import { Contact, EntropyAlert } from '@/types';

const Index = () => {
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'contact'>('dashboard');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [favorCoins, setFavorCoins] = useState(1250);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState('');

  const lowEntropyAlerts: EntropyAlert[] = [
    { id: "a1", name: "Sarah Chen", days: 12, suggestion: "Consider reaching out with a casual message" },
    { id: "a2", name: "Mike Johnson", days: 8, suggestion: "Birthday is coming up next week" },
    { id: "a3", name: "Liu Wei", days: 15, suggestion: "Haven't responded to their last message" }
  ];

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscription('');
    setAiAnalysis('');
    setShowConfirmation(false);
    
    // Simulate real-time transcription
    const phrases = [
      "Had lunch with Sarah today...",
      "Had lunch with Sarah today, she helped me with...",
      "Had lunch with Sarah today, she helped me with the presentation and I paid for the meal...",
      "Had lunch with Sarah today, she helped me with the presentation and I paid for the meal, around 80 dollars total."
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < phrases.length && isRecording) {
        setTranscription(phrases[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Simulate AI processing and analysis
    setTimeout(() => {
      setIsProcessing(false);
      const analysisResult = "Interaction Type: Social Support\nContact: Sarah Chen\nFavor Direction: You owe favor (paid for meal ~$80)\nRelationship Impact: Positive - strengthened professional relationship\nSuggested Follow-up: Thank her for the help with presentation";
      setAiAnalysis(analysisResult);
      setEditedAnalysis(analysisResult);
      setShowConfirmation(true);
    }, 2000);
  };

  const handleConfirmAnalysis = () => {
    const finalAnalysis = isEditing ? editedAnalysis : aiAnalysis;
    const coinsEarned = Math.floor(Math.random() * 50) + 10;
    setFavorCoins(prev => prev + coinsEarned);
    toast(`Social interaction recorded! +${coinsEarned} favor coins`, {
      icon: "🎙️"
    });
    
    // Reset all states
    setTranscription('');
    setAiAnalysis('');
    setShowConfirmation(false);
    setIsEditing(false);
    setEditedAnalysis('');
  };

  const handleRejectAnalysis = () => {
    setShowConfirmation(false);
    setAiAnalysis('');
    setEditedAnalysis('');
    setTranscription('');
  };

  const handleTextInput = (text: string) => {
    if (text.trim()) {
      const coinsEarned = Math.floor(Math.random() * 30) + 5;
      setFavorCoins(prev => prev + coinsEarned);
      toast(`Text interaction processed! +${coinsEarned} favor coins`, {
        icon: "📝"
      });
    }
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Header with Favor Coins */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SEE</h1>
          <p className="text-sm text-gray-600">Social Empathy Engine</p>
        </div>
        <motion.div 
          className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-4 h-4 mr-2" />
          <span className="font-bold">{favorCoins.toLocaleString()}</span>
          <span className="text-xs ml-1">FC</span>
        </motion.div>
      </motion.div>

      {/* Social Entropy Graph - At the top */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <NetworkGraph 
          embedded={true}
          onContactSelect={(contact) => {
            setSelectedContact(contact);
            setActiveScreen('contact');
          }}
        />
      </motion.div>

      {/* Input Section */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl p-6 shadow-xl mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Record Social Interactions</h3>
        
        {/* Voice Recording Interface */}
        {(isRecording || isProcessing || transcription || showConfirmation) ? (
          <div className="text-center">
            {/* Processing Status */}
            {isProcessing ? (
              <div className="mb-4">
                <motion.div
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm text-gray-600">AI analyzing interaction...</p>
              </div>
            ) : showConfirmation ? (
              // AI Analysis Confirmation
              <div className="space-y-4">
                <div className="text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">AI Analysis Result:</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-blue-600"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      {isEditing ? 'Cancel Edit' : 'Edit'}
                    </Button>
                  </div>
                  
                  {isEditing ? (
                    <Textarea
                      value={editedAnalysis}
                      onChange={(e) => setEditedAnalysis(e.target.value)}
                      className="w-full min-h-[120px] p-3 border rounded-lg"
                      placeholder="Edit the AI analysis..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                        {aiAnalysis}
                      </pre>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleRejectAnalysis}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    onClick={handleConfirmAnalysis}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Confirm & Save
                  </Button>
                </div>
              </div>
            ) : (
              // Recording Interface
              <>
                <motion.button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto ${
                    isRecording 
                      ? 'bg-gradient-to-br from-red-500 to-red-600' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRecording ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                  
                  {/* Audio Level Animation */}
                  {isRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white"
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

                {/* Real-time Transcription */}
                {transcription && !isProcessing && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 text-sm">{transcription}</p>
                  </div>
                )}

                {/* Control Buttons */}
                {transcription && !isRecording && !isProcessing && (
                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTranscription('');
                        setIsRecording(false);
                      }}
                    >
                      Try Again
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleStopRecording} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Process with AI
                    </Button>
                  </div>
                )}

                {isRecording && (
                  <p className="text-sm text-gray-600">Recording... Tap to stop</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Voice Input Button */}
            <div className="flex justify-center mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleStartRecording}
                className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white shadow-lg"
              >
                <Mic className="w-8 h-8" />
              </motion.button>
            </div>
            
            {/* Text Input */}
            <div className="text-center">
              <input 
                type="text" 
                placeholder="Quick note about an interaction..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    handleTextInput(target.value);
                    target.value = '';
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">Press Enter to submit or use voice input above</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Low Entropy Alerts */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              Low Entropy Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowEntropyAlerts.map((alert, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg cursor-pointer"
                onClick={() => {
                  setSelectedContact({
                    id: alert.id,
                    name: alert.name,
                    type: 'colleague', // 假设默认类型
                    coins: 0,          // 假设默认积分
                  });
                  setActiveScreen('contact');
                }}
              >
                <div>
                  <p className="font-medium text-gray-800">{alert.name}</p>
                  <p className="text-xs text-gray-600">{alert.suggestion}</p>
                </div>
                <Badge variant="outline" className="text-orange-600">
                  {alert.days}d
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {activeScreen === 'dashboard' && renderDashboard()}
      {activeScreen === 'contact' && selectedContact && (
        <ContactProfile 
          contact={selectedContact}
          onBack={() => setActiveScreen('dashboard')}
        />
      )}
    </AnimatePresence>
  );
};

export default Index;
