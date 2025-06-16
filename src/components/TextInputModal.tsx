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
    '与某人喝咖啡',
    '与某人开会',
    '与某人通话',
    '与某人共进午餐',
    '帮助某人'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-[12px] shadow-lg max-w-lg w-full overflow-hidden border border-border"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-medium text-lg text-primary">记录社交互动</h3>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 text-secondary hover:text-primary"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-secondary mb-1.5 block">
                  联系人
                </label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="您与谁进行了互动？"
                  className="w-full bg-accent/30 border-border text-primary"
                />
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentContacts.map((name, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="flex items-center bg-accent/30 hover:bg-accent/50 border-border text-secondary hover:text-primary"
                      onClick={() => setContact(name)}
                    >
                      <User className="h-3 w-3 mr-1" />
                      {name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary mb-1.5 block">
                  互动详情
                </label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="描述您的社交互动..."
                  className="min-h-[100px] w-full bg-accent/30 border-border text-primary"
                />
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickTemplates.map((template, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="flex items-center bg-accent/30 hover:bg-accent/50 border-border text-secondary hover:text-primary"
                      onClick={() => setText(template)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-accent/50 border-t border-border flex justify-end space-x-3">
              <Button
                variant="outline"
                className="border-border bg-card/80 text-secondary hover:text-primary"
                onClick={onClose}
                disabled={isProcessing}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!text.trim() || isProcessing}
                className="bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    处理中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    提交
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