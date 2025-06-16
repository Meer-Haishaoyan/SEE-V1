import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Check, Edit2, X, TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import NetworkGraph from '@/components/NetworkGraph';
import ContactProfile from '@/components/ContactProfile';
import TextInputModal from '@/components/TextInputModal';
import { Contact, EntropyAlert } from '@/types';

interface IndexProps {
  isMobile?: boolean;
}

const Index = ({ isMobile = false }: IndexProps) => {
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
  const [selectedRelation, setSelectedRelation] = useState<any>(null);
  const [showTextInputModal, setShowTextInputModal] = useState(false);
  const [textInteractionAnalysis, setTextInteractionAnalysis] = useState('');
  const [showTextConfirmation, setShowTextConfirmation] = useState(false);

  // Check for selected contact in localStorage on component mount
  useEffect(() => {
    const selectedContactName = localStorage.getItem('selectedContactName');
    if (selectedContactName) {
      // Find the contact by name (in a real app, this would be a more robust lookup)
      // This is a simplified example - you would typically have all contacts in state 
      // or fetch the contact from an API
      const nodes = [
        { id: 'you', name: 'You', type: 'self', coins: 0 },
        { id: 'sarah', name: 'Sarah Chen', type: 'friend', coins: 250 },
        { id: 'mike', name: 'Mike Johnson', type: 'colleague', coins: -80 },
        { id: 'liu', name: 'Liu Wei', type: 'friend', coins: 150 },
        { id: 'anna', name: 'Anna Smith', type: 'acquaintance', coins: 45 },
        { id: 'david', name: 'David Kim', type: 'family', coins: -25 },
        { id: 'emma', name: 'Emma Thompson', type: 'colleague', coins: 90 }
      ];
      
      const foundContact = nodes.find(contact => contact.name === selectedContactName);
      
      if (foundContact) {
        setSelectedContact(foundContact as Contact);
        setActiveScreen('contact');
      }
      
      // Clear the localStorage item after using it
      localStorage.removeItem('selectedContactName');
    }
  }, []);

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
    toast(`Social interaction recorded! Relationship value updated`, {
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
    setShowTextInputModal(false);
    
    if (text.trim()) {
      setIsProcessing(true);
      
      // Simulate AI processing of the text input
      setTimeout(() => {
        setIsProcessing(false);
        
        // Generate an analysis similar to voice recording
        const contactName = text.includes("with") ? text.split("with")[1].trim().split(" ")[0] : "Contact";
        const analysisResult = `Interaction Type: Information Exchange\nContact: ${contactName}\nFavor Direction: Neutral\nRelationship Impact: Positive - maintained professional relationship\nSuggested Follow-up: Schedule a follow-up meeting next week`;
        
        setTextInteractionAnalysis(analysisResult);
        setShowTextConfirmation(true);
      }, 1500);
    }
  };
  
  const handleSubmitTextInteraction = (text: string, contact: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing of the text input
    setTimeout(() => {
      setIsProcessing(false);
      
      // Generate an analysis based on the text and contact
      const analysisResult = `Interaction Type: Information Exchange\nContact: ${contact}\nContent: "${text}"\nFavor Direction: Neutral\nRelationship Impact: Positive - maintained professional relationship\nSuggested Follow-up: Schedule a follow-up meeting next week`;
      
      setTextInteractionAnalysis(analysisResult);
      setShowTextConfirmation(true);
    }, 1500);
  };
  
  const handleConfirmTextAnalysis = () => {
    const coinsEarned = Math.floor(Math.random() * 30) + 5;
    setFavorCoins(prev => prev + coinsEarned);
    toast(`Text interaction processed! Relationship value updated`, {
      icon: "📝"
    });
    
    setTextInteractionAnalysis('');
    setShowTextConfirmation(false);
  };
  
  const handleRejectTextAnalysis = () => {
    setTextInteractionAnalysis('');
    setShowTextConfirmation(false);
  };

  const handleRelationSelect = (data: any) => {
    setSelectedRelation(data);
  };

  const renderDashboard = () => (
    <div className="min-h-screen">
      {/* Weather-style header with blurred background */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-background to-background-secondary text-white pt-12 pb-8 px-4 sm:px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/assets/pattern-light.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className={`${isMobile ? 'mobile-container' : 'max-w-3xl mx-auto'} relative`}>
          {/* App title with AI indicator */}
          <div className="flex items-center mb-3">
            <h1 className="text-3xl font-bold text-primary">SEE</h1>
            <div className="ml-3 flex items-center bg-accent/50 backdrop-blur-md rounded-full px-2 py-0.5">
              <BrainCircuit className="w-3.5 h-3.5 mr-1 text-primary" />
              <span className="text-xs font-medium text-primary">AI Powered</span>
            </div>
          </div>
          <p className="text-lg font-medium text-primary/90">Social Empathy Engine</p>
          
          {/* Animated AI pulse indicator */}
          <motion.div 
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5
            }}
          >
            <div className="mr-2.5 relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <Sparkles className="w-6 h-6 relative z-10 text-primary" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-primary">AI Analysis</div>
              <div className="text-xs opacity-80 text-secondary">Optimizing your social network</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className={`${isMobile ? 'mobile-container' : 'max-w-3xl mx-auto px-4'} -mt-5`}>
        {/* Social Network Graph - Now with Apple-style card */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 relative"
        >
          <div className="app-card overflow-hidden">
            <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-primary">社交网络</h2>
                <div className="flex items-center space-x-1.5">
                  <Badge variant="outline" className="bg-accent/50 text-primary border-border">
                    {favorCoins} FC
                  </Badge>
                </div>
              </div>
              <div className={`${isMobile ? 'h-64' : 'h-80'} rounded-lg overflow-hidden`}>
                <NetworkGraph 
                  onContactSelect={(contact) => {
                    setSelectedContact(contact);
                    setActiveScreen('contact');
                  }}
                  onRelationSelect={handleRelationSelect}
                  embedded={false}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voice Input Section */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="app-card overflow-hidden">
            <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-primary">记录互动</h2>
                {!isRecording && !isProcessing && !showConfirmation && !showTextInputModal && (
                  <Button 
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    className="text-primary border-border bg-accent/30 hover:bg-accent/50"
                    onClick={() => setShowTextInputModal(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    文字输入
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {/* Recording/Processing State */}
                {(isRecording || isProcessing) && !showConfirmation && !showTextConfirmation && (
                  <motion.div
                    key="recording"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    {isRecording ? (
                      <>
                        <motion.button
                          onClick={handleStopRecording}
                          className="w-20 h-20 rounded-full bg-nodeNegative/90 flex items-center justify-center shadow-lg mx-auto"
                          whileTap={{ scale: 0.95 }}
                        >
                          <MicOff className="w-10 h-10 text-white" />
                        </motion.button>
                        <p className="mt-4 text-primary">正在录音... 点击停止</p>
                        {transcription && (
                          <div className="mt-4 p-3 bg-accent/30 rounded-lg text-left">
                            <p className="text-primary">{transcription}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-8">
                        <motion.div
                          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-lg font-medium text-primary">AI分析中...</p>
                        <p className="text-sm text-secondary mt-2">处理语言并提取互动细节</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Ready to Record State */}
                {!isRecording && !isProcessing && !showConfirmation && !showTextConfirmation && !showTextInputModal && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <motion.button
                      onClick={handleStartRecording}
                      className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mic className="w-12 h-12 text-white" />
                    </motion.button>
                    <p className="mt-4 text-primary text-center">点击开始录音<br />分享你的社交互动</p>
                  </motion.div>
                )}

                {/* Analysis Confirmation */}
                {showConfirmation && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <h3 className="font-medium text-primary text-lg mb-2">AI分析结果</h3>
                      
                      {isEditing ? (
                        <div className="mb-3">
                          <Textarea 
                            value={editedAnalysis} 
                            onChange={(e) => setEditedAnalysis(e.target.value)} 
                            className="bg-accent/50 border-border text-primary min-h-[120px]"
                          />
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap text-secondary text-sm mb-3">{aiAnalysis}</pre>
                      )}
                      
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-secondary hover:text-primary border-border bg-accent/30"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? 'Cancel Edit' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        className="text-secondary hover:text-primary border-border bg-accent/30"
                        onClick={handleRejectAnalysis}
                      >
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </Button>
                      <Button 
                        onClick={handleConfirmAnalysis}
                        className="bg-primary hover:bg-primary/80 text-primary-foreground"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        确认
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Text Input Confirmation */}
                {showTextConfirmation && (
                  <motion.div
                    key="textConfirmation"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <h3 className="font-medium text-primary text-lg mb-2">文本分析结果</h3>
                      <pre className="whitespace-pre-wrap text-secondary text-sm">{textInteractionAnalysis}</pre>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        className="text-secondary hover:text-primary border-border bg-accent/30"
                        onClick={handleRejectTextAnalysis}
                      >
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </Button>
                      <Button 
                        onClick={handleConfirmTextAnalysis}
                        className="bg-primary hover:bg-primary/80 text-primary-foreground"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        确认
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Low Entropy Alert Cards */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-primary mb-4">关系警报</h2>
          
          <div className={`space-y-3 ${isMobile ? '' : 'grid grid-cols-1 gap-3'}`}>
            {lowEntropyAlerts.map((alert) => (
              <Card key={alert.id} className="border-none bg-accent/30 shadow-sm">
                <CardContent className={`${isMobile ? 'p-3' : 'p-4'} flex items-center justify-between`}>
                  <div>
                    <div className="font-medium text-primary">{alert.name}</div>
                    <div className="text-sm text-secondary flex items-center mt-1">
                      <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-nodeNegative" /> 
                      {alert.days}天未互动
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    className="shrink-0 text-secondary hover:text-primary border-border bg-accent/50"
                  >
                    关注
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Text input modal */}
      <TextInputModal
        isOpen={showTextInputModal}
        onClose={() => setShowTextInputModal(false)} 
        onSubmit={handleSubmitTextInteraction}
      />
    </div>
  );

  return (
    <>
      {activeScreen === 'dashboard' && renderDashboard()}
      {activeScreen === 'contact' && selectedContact && (
        <ContactProfile
          contact={selectedContact as Contact}
          onBack={() => setActiveScreen('dashboard')}
        />
      )}
    </>
  );
};

export default Index;
