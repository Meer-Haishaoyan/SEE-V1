import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Check, Edit2, X, TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';
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
  const [selectedRelation, setSelectedRelation] = useState<any>(null);

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
    toast(`社交互动已记录！已更新关系价值`, {
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
      toast(`文字互动已处理！关系价值已更新`, {
        icon: "📝"
      });
    }
  };

  const handleRelationSelect = (data: any) => {
    setSelectedRelation(data);
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Weather-style header with blurred background */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-blue-600 to-blue-400 text-white pt-12 pb-8 px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/assets/pattern-light.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300 rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className="max-w-3xl mx-auto relative">
          {/* App title with AI indicator */}
          <div className="flex items-center mb-3">
            <h1 className="text-3xl font-bold">SEE</h1>
            <div className="ml-3 flex items-center bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5">
              <BrainCircuit className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs font-medium">AI 驱动</span>
            </div>
          </div>
          <p className="text-lg font-medium text-white/90">Social Empathy Engine</p>
          
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
                className="absolute inset-0 rounded-full bg-blue-200"
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
              <Sparkles className="w-6 h-6 relative z-10" />
            </div>
            <div className="text-sm">
              <div className="font-semibold">AI 分析中</div>
              <div className="text-xs opacity-80">优化您的社交网络</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 -mt-5">
        {/* Social Network Graph - Now with Apple-style card */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 relative"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">社交网络</h2>
                <div className="flex items-center space-x-1.5">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <BrainCircuit className="w-3 h-3 mr-1" />
                    AI 分析
                  </Badge>
                </div>
              </div>

              <div className="relative">
                <NetworkGraph 
                  embedded={true}
                  onContactSelect={(contact) => {
                    setSelectedContact(contact);
                    setActiveScreen('contact');
                  }}
                  onRelationSelect={handleRelationSelect}
                />

                {/* Add data panel next to graph */}
                <AnimatePresence>
                  {selectedRelation && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute right-4 top-4 bg-white/90 backdrop-blur-lg shadow-md rounded-xl p-4 border border-gray-200 max-w-[180px] text-sm"
                    >
                      <div className="font-medium text-gray-900 mb-1.5">关系详情</div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-600 text-xs">从</span>
                          <div className="font-medium">{selectedRelation.from}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">到</span>
                          <div className="font-medium">{selectedRelation.to}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">互动强度</span>
                          <div className="font-medium">{Math.round(selectedRelation.strength * 100)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">净值</span>
                          <div className={`font-medium ${
                            selectedRelation.balance === 'positive' ? 'text-green-600' : 
                            selectedRelation.balance === 'negative' ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {selectedRelation.balance === 'positive' ? '+125' : 
                            selectedRelation.balance === 'negative' ? '-80' : '0'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Apple Weather style bottom panel with AI insights */}
            <div className="bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 px-5 py-3.5">
              <div className="flex items-center text-sm">
                <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-medium text-gray-800">AI 洞察：</span>
                <span className="text-gray-600 ml-2">您的网络具有高度凝聚力，强化与刘伟和莎拉的联系可提升整体稳定性</span>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Input Section */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden mb-8"
      >
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-800 mb-5 flex items-center">
            <span>记录社交互动</span>
            <Badge variant="outline" className="ml-3 bg-blue-50 text-blue-700 border-blue-200 font-normal">
              <BrainCircuit className="w-3 h-3 mr-1" />
              AI 辅助
            </Badge>
          </h3>
        
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
                <p className="text-sm text-gray-600">分析互动中...</p>
              </div>
            ) : showConfirmation ? (
              // AI Analysis Confirmation
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">分析结果</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-blue-600 text-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      {isEditing ? '完成' : '编辑'}
                    </Button>
                  </div>
                  
                  {isEditing ? (
                    <Textarea
                      value={editedAnalysis}
                      onChange={(e) => setEditedAnalysis(e.target.value)}
                      className="w-full min-h-[120px] text-sm p-3 border rounded-lg"
                      placeholder="编辑分析结果..."
                    />
                  ) : (
                    <div className="p-4 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-100">
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
                    className="text-gray-700 border-gray-300"
                  >
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConfirmAnalysis}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    确认
                  </Button>
                </div>
              </div>
            ) : (
              // Recording Interface
              <div>
                <div className="mb-5 p-4 bg-gray-50/70 rounded-xl">
                  <p className="font-medium text-gray-800 mb-2 text-sm">录音中...</p>
                  <p className="text-gray-600">{transcription || "正在聆听..."}</p>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleStopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    <MicOff className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button 
                onClick={handleStartRecording}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center py-6"
              >
                <Mic className="w-5 h-5 mr-2" />
                <span className="font-medium">语音记录</span>
              </Button>

              <Button 
                onClick={() => handleTextInput("Had coffee with Mike, discussed project timeline")}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 flex items-center justify-center py-6"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="font-medium">文本记录</span>
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">记录您的社交互动，AI将自动分析并量化关系变化</p>
          </div>
        )}
        </div>

        {/* AI Activity Indicator - Weather app style bottom panel */}
        <div className="bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-sm">
              <motion.div 
                className="w-2 h-2 bg-green-500 rounded-full" 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-gray-600">AI 模型已激活</span>
            </div>
            <div className="text-xs text-gray-500">今日分析: 12 次互动</div>
          </div>
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <Sparkles className="text-blue-500 w-5 h-5 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">AI 洞察与建议</h3>
            </div>
            
            <div className="space-y-4">
              {lowEntropyAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-gradient-to-r from-blue-50 to-blue-50/30 border border-blue-100 rounded-xl p-3 flex items-start"
                >
                  <div className="mr-3 mt-0.5">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                      {alert.days}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{alert.name}</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{alert.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Weather app style bottom panel */}
          <div className="bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 px-5 py-3.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">查看全部 AI 洞察</span>
              <motion.div 
                className="w-5 h-5 flex items-center justify-center text-blue-500 bg-blue-50 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
  );

  return (
    <div>
      {activeScreen === 'dashboard' && renderDashboard()}
      {activeScreen === 'contact' && selectedContact && (
        <ContactProfile 
          contact={selectedContact} 
          onBack={() => setActiveScreen('dashboard')}
        />
      )}
    </div>
  );
};

export default Index;
