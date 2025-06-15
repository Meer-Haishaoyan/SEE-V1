import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, contact: string) => void;
}

const TextInputModal: React.FC<TextInputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [contact, setContact] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onSubmit(text, contact);
      setIsProcessing(false);
      setText('');
      setContact('');
      onClose();
    }, 1000);
  };

  const recentContacts = [
    'Sarah Chen',
    'Mike Johnson',
    'Liu Wei',
    'Anna Smith',
    'David Kim'
  ];

  const quickTemplates = [
    'Had coffee with ',
    'Meeting with ',
    'Phone call with ',
    'Lunch with ',
    'Helped '
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-lg max-w-lg w-full overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-medium text-lg">Record Social Interaction</h3>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Contact
                </label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Who did you interact with?"
                  className="w-full"
                />
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentContacts.map((name, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="flex items-center bg-gray-50 hover:bg-gray-100 border-gray-200"
                      onClick={() => setContact(name)}
                    >
                      <User className="h-3 w-3 mr-1 text-gray-500" />
                      {name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Interaction Details
                </label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe your social interaction..."
                  className="min-h-[100px] w-full"
                />
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickTemplates.map((template, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="flex items-center bg-gray-50 hover:bg-gray-100 border-gray-200"
                      onClick={() => setText(template)}
                    >
                      <Clock className="h-3 w-3 mr-1 text-gray-500" />
                      {template}...
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!text.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-blue-200 border-t-white rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextInputModal; 