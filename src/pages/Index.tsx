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
    <div className="min-h-screen bg-neutral-50 p-4 max-w-3xl mx-auto">
      {/* Header with Favor Coins */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">SEE</h1>
          <p className="text-sm text-gray-600">Social Empathy Engine</p>
        </div>
        <motion.div 
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-4 h-4 mr-2" />
          <span className="font-medium">{favorCoins.toLocaleString()}</span>
          <span className="text-xs ml-1 opacity-80">FC</span>
        </motion.div>
      </motion.div>

      {/* Social Entropy Graph - At the top */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
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
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <h3 className="text-lg font-medium text-gray-800 mb-5">Record Social Interactions</h3>
        
        {/* Voice Recording Interface */}
        {(isRecording || isProcessing || transcription || showConfirmation) ? (
          <div>
            {/* Processing Status */}
            {isProcessing ? (
              <div className="mb-6 flex flex-col items-center">
                <motion.div
                  className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm text-gray-600">Analyzing interaction...</p>
              </div>
            ) : showConfirmation ? (
              // AI Analysis Confirmation
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">Analysis Results</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-blue-600 text-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      {isEditing ? 'Done' : 'Edit'}
                    </Button>
                  </div>
                  
                  {isEditing ? (
                    <Textarea
                      value={editedAnalysis}
                      onChange={(e) => setEditedAnalysis(e.target.value)}
                      className="w-full min-h-[120px] text-sm p-3 border rounded-lg"
                      placeholder="Edit the analysis..."
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {aiAnalysis}
                      </pre>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAnalysis}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmAnalysis}
                    className="bg-blue-500 hover:bg-blue-600 text-sm"
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              // Recording Interface
              <>
                <div className="flex justify-center mb-5">
                  <motion.button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm ${
                      isRecording 
                        ? 'bg-red-500' 
                        : 'bg-blue-500'
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
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.button>
                </div>

                {/* Real-time Transcription */}
                {transcription && !isProcessing && (
                  <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-700 text-sm">{transcription}</p>
                  </div>
                )}

                {/* Control Buttons */}
                {transcription && !isRecording && !isProcessing && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTranscription('');
                        setIsRecording(false);
                      }}
                      className="text-sm"
                    >
                      Try Again
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleStopRecording} 
                      className="bg-blue-500 hover:bg-blue-600 text-sm"
                    >
                      Analyze
                    </Button>
                  </div>
                )}

                {isRecording && (
                  <p className="text-xs text-center text-gray-500 mt-3">Tap microphone to stop recording</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Voice Input Button */}
            <div className="flex justify-center mb-5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartRecording}
                className="flex flex-col items-center justify-center w-16 h-16 bg-blue-500 rounded-full text-white shadow-sm"
              >
                <Mic className="w-6 h-6" />
              </motion.button>
            </div>
            
            {/* Text Input */}
            <div>
              <input 
                type="text" 
                placeholder="Type a note about an interaction..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    handleTextInput(target.value);
                    target.value = '';
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Press Enter to submit</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Low Entropy Alerts */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center text-gray-800">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Connection Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {lowEntropyAlerts.map((alert, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01, backgroundColor: "rgba(243, 244, 246, 1)" }}
                className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer border border-gray-100"
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
                  <p className="font-medium text-sm text-gray-800">{alert.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.suggestion}</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
