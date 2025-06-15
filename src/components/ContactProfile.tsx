import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, Heart, ChevronRight, Edit3, Phone, Mail, MessageCircle, Save, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Contact, Interaction } from '@/types';
import { toast } from 'sonner';

interface ContactProfileProps {
  contact: Contact;
  onBack: () => void;
}

const ContactProfile = ({ contact, onBack }: ContactProfileProps) => {
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [contactInfo, setContactInfo] = useState({
    phone: contact.phone || '',
    email: contact.email || '',
    notes: contact.notes || ''
  });
  
  // 新增状态管理
  const [isEditingPhone, setIsEditingPhone] = useState(!contact.phone);
  const [isEditingEmail, setIsEditingEmail] = useState(!contact.email);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [validPhone, setValidPhone] = useState(true);
  const [validEmail, setValidEmail] = useState(true);

  // 表单验证函数
  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phone === '' || phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === '' || emailRegex.test(email);
  };

  // 保存电话号码
  const handleSavePhone = async () => {
    if (!validatePhone(contactInfo.phone)) {
      setValidPhone(false);
      return;
    }
    
    setIsSavingPhone(true);
    
    try {
      // 这里应该是调用API保存电话号码的逻辑
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 假设保存成功
      toast.success('电话号码已保存', { 
        duration: 3000,
        icon: <Check size={18} className="text-green-500" />
      });
      
      setIsEditingPhone(false);
      contact.phone = contactInfo.phone;
    } catch (error) {
      toast.error('保存失败，请重试');
      console.error('保存电话号码失败:', error);
    } finally {
      setIsSavingPhone(false);
    }
  };

  // 保存邮箱
  const handleSaveEmail = async () => {
    if (!validateEmail(contactInfo.email)) {
      setValidEmail(false);
      return;
    }
    
    setIsSavingEmail(true);
    
    try {
      // 这里应该是调用API保存邮箱的逻辑
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 假设保存成功
      toast.success('邮箱地址已保存', {
        duration: 3000,
        icon: <Check size={18} className="text-green-500" />
      });
      
      setIsEditingEmail(false);
      contact.email = contactInfo.email;
    } catch (error) {
      toast.error('保存失败，请重试');
      console.error('保存邮箱失败:', error);
    } finally {
      setIsSavingEmail(false);
    }
  };

  // 处理电话号码点击
  const handlePhoneClick = () => {
    if (contactInfo.phone && !isEditingPhone) {
      window.location.href = `tel:${contactInfo.phone}`;
    }
  };

  // 处理邮箱点击
  const handleEmailClick = () => {
    if (contactInfo.email && !isEditingEmail) {
      window.location.href = `mailto:${contactInfo.email}`;
    }
  };

  const interactions = [
    {
      id: "1",
      date: "2024-06-10",
      type: "favor_received",
      description: "Helped with presentation preparation",
      coins: +50,
      notes: "Sarah spent 2 hours helping me polish my quarterly presentation. Very thorough feedback.",
      originalInput: "Voice Recording: 'Had a great session with Sarah today. She really helped me polish my quarterly presentation - spent about 2 hours going through all the slides and gave me really detailed feedback. I owe her big time for this one.'"
    },
    {
      id: "2",
      date: "2024-06-05", 
      type: "social",
      description: "Coffee meeting",
      coins: +15,
      notes: "Casual catch-up over coffee. Discussed work challenges and weekend plans.",
      originalInput: "Text Input: 'Coffee with Sarah - casual catchup, talked about work stuff and weekend plans'"
    },
    {
      id: "3",
      date: "2024-05-28",
      type: "favor_given",
      description: "Recommended for job opportunity",
      coins: -30,
      notes: "Connected Sarah with hiring manager at TechCorp. She got the interview.",
      originalInput: "Voice Recording: 'Just connected Sarah with the hiring manager at TechCorp. Sent an intro email and they're setting up an interview next week. Hope this works out for her.'"
    },
    {
      id: "4",
      date: "2024-05-20",
      type: "social",
      description: "Birthday celebration",
      coins: +20,
      notes: "Organized surprise birthday lunch. Sarah was genuinely touched by the gesture.",
      originalInput: "Text Input: 'Organized surprise birthday lunch for Sarah - she was so happy and surprised!'"
    }
  ];

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'favor_received': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'favor_given': return <Heart className="w-5 h-5 text-blue-600" />;
      case 'social': return <MessageCircle className="w-5 h-5 text-purple-600" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'favor_received': return 'Favor Received';
      case 'favor_given': return 'Favor Given';
      case 'social': return 'Social';
      default: return 'Other';
    }
  };

  const suggestions = [
    "Consider inviting her to the upcoming team social event",
    "Her expertise in design could be valuable for your current project",
    "She mentioned interest in hiking - could be a good shared activity"
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="p-1 mr-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-xl font-medium text-gray-800">Contact Profile</h1>
      </div>

      {/* Contact Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6"
      >
        <div className="flex items-center space-x-4 mb-5">
          <Avatar className="w-16 h-16 border-2 border-gray-100">
            <AvatarFallback className="text-xl font-semibold bg-blue-500 text-white">
              {contact.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">{contact.name}</h2>
            <p className="text-gray-600 text-sm capitalize">{contact.type}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500 mr-2">Favor Balance:</span>
              <Badge 
                variant={contact.coins > 0 ? "default" : "destructive"}
                className={contact.coins > 0 ? "bg-green-100 text-green-800 font-medium" : "bg-red-100 text-red-800 font-medium"}
              >
                {contact.coins > 0 ? '+' : ''}{contact.coins} FC
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact Information Management */}
        <div className="space-y-4">
          {/* 电话号码区域 */}
          <div>
            <Label htmlFor="phone" className="text-sm text-gray-700 mb-1.5 block flex justify-between">
              <span>电话</span>
              {!isEditingPhone && contactInfo.phone && (
                <button 
                  onClick={() => setIsEditingPhone(true)}
                  className="text-blue-500 text-xs flex items-center hover:text-blue-700 transition-colors"
                  aria-label="编辑电话号码"
                >
                  <span className="font-medium">编辑</span>
                </button>
              )}
            </Label>
            
            {isEditingPhone ? (
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <div className="flex-1 flex items-center space-x-2">
                  <Input
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => {
                      setContactInfo(prev => ({ ...prev, phone: e.target.value }));
                      setValidPhone(validatePhone(e.target.value));
                    }}
                    placeholder="添加电话号码"
                    className={`flex-1 bg-gray-50 border-gray-200 ${!validPhone ? 'border-red-500 focus:ring-red-200' : ''}`}
                    disabled={isSavingPhone}
                  />
                  <Button 
                    onClick={handleSavePhone} 
                    disabled={isSavingPhone}
                    className="h-9 bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-md px-4 transition-colors"
                    aria-label="保存电话号码"
                  >
                    {isSavingPhone ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">保存</span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div 
                className={`flex items-center p-3 rounded-lg ${contactInfo.phone ? 'bg-blue-50/70 hover:bg-blue-100/80 cursor-pointer' : 'bg-gray-50'} transition-colors`}
                onClick={handlePhoneClick}
                whileTap={{ scale: contactInfo.phone ? 0.98 : 1 }}
              >
                <Phone className={`w-4 h-4 mr-2.5 ${contactInfo.phone ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={contactInfo.phone ? 'text-blue-700 font-medium' : 'text-gray-500'}>
                  {contactInfo.phone || '未添加电话号码'}
                </span>
                {contactInfo.phone && <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-blue-500" />}
              </motion.div>
            )}
            {!validPhone && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1.5 ml-1"
              >
                请输入有效的电话号码
              </motion.p>
            )}
          </div>
          
          {/* 邮箱区域 */}
          <div>
            <Label htmlFor="email" className="text-sm text-gray-700 mb-1.5 block flex justify-between">
              <span>邮箱</span>
              {!isEditingEmail && contactInfo.email && (
                <button 
                  onClick={() => setIsEditingEmail(true)}
                  className="text-blue-500 text-xs flex items-center hover:text-blue-700 transition-colors"
                  aria-label="编辑邮箱"
                >
                  <span className="font-medium">编辑</span>
                </button>
              )}
            </Label>
            
            {isEditingEmail ? (
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <div className="flex-1 flex items-center space-x-2">
                  <Input
                    id="email"
                    value={contactInfo.email}
                    onChange={(e) => {
                      setContactInfo(prev => ({ ...prev, email: e.target.value }));
                      setValidEmail(validateEmail(e.target.value));
                    }}
                    placeholder="添加邮箱地址"
                    className={`flex-1 bg-gray-50 border-gray-200 ${!validEmail ? 'border-red-500 focus:ring-red-200' : ''}`}
                    disabled={isSavingEmail}
                  />
                  <Button 
                    onClick={handleSaveEmail}
                    disabled={isSavingEmail}
                    className="h-9 bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-md px-4 transition-colors"
                    aria-label="保存邮箱"
                  >
                    {isSavingEmail ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">保存</span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div 
                className={`flex items-center p-3 rounded-lg ${contactInfo.email ? 'bg-blue-50/70 hover:bg-blue-100/80 cursor-pointer' : 'bg-gray-50'} transition-colors`}
                onClick={handleEmailClick}
                whileTap={{ scale: contactInfo.email ? 0.98 : 1 }}
              >
                <Mail className={`w-4 h-4 mr-2.5 ${contactInfo.email ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={contactInfo.email ? 'text-blue-700 font-medium' : 'text-gray-500'}>
                  {contactInfo.email || '未添加邮箱地址'}
                </span>
                {contactInfo.email && <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-blue-500" />}
              </motion.div>
            )}
            {!validEmail && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1.5 ml-1"
              >
                请输入有效的邮箱地址
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* AI Suggestions */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6 border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-gray-800">Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interaction History */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center text-gray-800">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              Interaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {interactions.map((interaction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100"
                onClick={() => setSelectedInteraction(selectedInteraction?.id === interaction.id ? null : interaction as Interaction)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {getInteractionIcon(interaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-800 text-sm leading-tight pr-2">{interaction.description}</h4>
                        <Badge 
                          variant={interaction.coins > 0 ? "default" : "destructive"}
                          className={`text-xs flex-shrink-0 ${interaction.coins > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {interaction.coins > 0 ? '+' : ''}{interaction.coins} FC
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-0.5 bg-gray-50 rounded-full text-gray-600 border border-gray-200">
                          {getTypeLabel(interaction.type)}
                        </span>
                        <span className="text-xs text-gray-500">{interaction.date}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ml-2 flex-shrink-0 mt-0.5 ${selectedInteraction?.id === interaction.id ? 'rotate-90' : ''}`} />
                </div>
                
                {/* Expanded Details */}
                {selectedInteraction?.id === interaction.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-gray-100"
                  >
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Notes:</h5>
                        <p className="text-sm text-gray-600">{interaction.notes}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Original Input:</h5>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-gray-600">
                          {interaction.originalInput}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContactProfile;
