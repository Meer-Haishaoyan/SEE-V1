import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, Heart, ChevronRight, Edit3, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Contact, Interaction } from '@/types';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">Contact Profile</h1>
        <div className="w-10"></div>
      </div>

      {/* Contact Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {contact.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{contact.name}</h2>
            <p className="text-gray-600 capitalize">{contact.type}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500 mr-2">Favor Balance:</span>
              <Badge 
                variant={contact.coins > 0 ? "default" : "destructive"}
                className={contact.coins > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {contact.coins > 0 ? '+' : ''}{contact.coins} FC
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact Information Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Add phone number"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <Input
                id="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Add email address"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Suggestions */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-purple-100 to-pink-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-800">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-purple-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interaction History */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Interaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interactions.map((interaction, index) => (
                <motion.div
                  key={index}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedInteraction(selectedInteraction?.id === interaction.id ? null : interaction as Interaction)}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getInteractionIcon(interaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-800 text-sm leading-tight pr-2">{interaction.description}</h4>
                          <Badge 
                            variant={interaction.coins > 0 ? "default" : "destructive"}
                            className={`text-xs flex-shrink-0 ${interaction.coins > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {interaction.coins > 0 ? '+' : ''}{interaction.coins} FC
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 border">
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
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Notes:</h5>
                          <p className="text-sm text-gray-600">{interaction.notes}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Original Input:</h5>
                          <div className="bg-white p-3 rounded border text-sm text-gray-700">
                            {interaction.originalInput}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContactProfile;
