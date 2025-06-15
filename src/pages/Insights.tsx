import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Search, Calendar, TrendingUp, Heart, MessageCircle, BarChart3, UserCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Contact } from '@/types';

interface InsightItem {
  id: string;
  category: 'network' | 'contact' | 'activity';
  title: string;
  description: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  relatedContacts?: string[];
}

const Insights = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const insights: InsightItem[] = [
    {
      id: 'ins1',
      category: 'network',
      title: 'Network Cohesion Analysis',
      description: 'Your network has high cohesion. Strengthening connections with Liu Wei and Sarah can improve overall stability.',
      date: '2024-06-12',
      impact: 'high',
      actionable: true,
      relatedContacts: ['Liu Wei', 'Sarah Chen']
    },
    {
      id: 'ins2',
      category: 'contact',
      title: 'Low Contact Entropy Alert',
      description: 'You haven\'t interacted with Mike Johnson in 8 days. His birthday is coming up next week.',
      date: '2024-06-14',
      impact: 'medium',
      actionable: true,
      relatedContacts: ['Mike Johnson']
    },
    {
      id: 'ins3',
      category: 'activity',
      title: 'Reciprocity Analysis',
      description: 'Your favor balance with Sarah Chen is +125 FC. Consider offering assistance on her upcoming project.',
      date: '2024-06-10',
      impact: 'medium',
      actionable: true,
      relatedContacts: ['Sarah Chen']
    },
    {
      id: 'ins4',
      category: 'network',
      title: 'Relationship Cluster Detection',
      description: 'Your professional and personal networks are highly separated. Consider bridging these communities.',
      date: '2024-06-08',
      impact: 'low',
      actionable: false
    },
    {
      id: 'ins5',
      category: 'contact',
      title: 'Response Pattern Analysis',
      description: 'Liu Wei hasn\'t responded to your last message from 15 days ago. Consider following up.',
      date: '2024-06-13',
      impact: 'high',
      actionable: true,
      relatedContacts: ['Liu Wei']
    },
    {
      id: 'ins6',
      category: 'activity',
      title: 'Interaction Quality Assessment',
      description: 'Your recent interactions with David have been primarily transactional. Consider scheduling a casual meet-up.',
      date: '2024-06-07',
      impact: 'medium',
      actionable: true,
      relatedContacts: ['David Kim']
    },
    {
      id: 'ins7',
      category: 'network',
      title: 'Network Growth Opportunity',
      description: 'Anna has connections that could diversify your network in the tech sector. Consider asking for introductions.',
      date: '2024-06-05',
      impact: 'medium',
      actionable: true,
      relatedContacts: ['Anna Smith']
    },
    {
      id: 'ins8',
      category: 'activity',
      title: 'Sentiment Analysis Trend',
      description: 'Your interactions with Emma show consistent positive sentiment. This relationship is developing well.',
      date: '2024-06-02',
      impact: 'low',
      actionable: false,
      relatedContacts: ['Emma Thompson']
    }
  ];
  
  // Handle contact navigation
  const handleContactClick = (contactName: string) => {
    // Store selected contact in localStorage to retrieve on dashboard
    localStorage.setItem('selectedContactName', contactName);
    // Navigate back to dashboard
    navigate('/');
  };

  // Handle insight action
  const handleInsightAction = (insight: InsightItem) => {
    if (insight.relatedContacts && insight.relatedContacts.length > 0) {
      // Navigate to the first related contact
      handleContactClick(insight.relatedContacts[0]);
    } else {
      // Navigate to dashboard without a specific contact
      navigate('/');
    }
  };
  
  const filteredInsights = insights.filter(insight => {
    // Filter by tab
    if (activeTab !== 'all' && insight.category !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query) ||
        (insight.relatedContacts?.some(contact => 
          contact.toLowerCase().includes(query)
        ))
      );
    }
    
    return true;
  });
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'network': return <BarChart3 className="w-4 h-4" />;
      case 'contact': return <UserCircle className="w-4 h-4" />;
      case 'activity': return <Calendar className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white pt-12 pb-8 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-white/10 hover:bg-white/20 mr-3"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
            <h1 className="text-2xl font-semibold">AI Insights</h1>
          </div>
          
          <div className="flex items-center space-x-3 relative">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 h-10 focus-visible:ring-white/30" 
                placeholder="Search insights..."
              />
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 -mt-5">
        {/* Tabs */}
        <Card className="shadow-sm border-gray-100 overflow-hidden">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 bg-gray-50 p-0 rounded-none h-auto">
              <TabsTrigger
                value="all"
                className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="network"
                className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Network
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Contacts
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Activities
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="p-0 mt-0">
              <div className="divide-y divide-gray-100">
                {filteredInsights.length > 0 ? (
                  filteredInsights.map(insight => (
                    <motion.div 
                      key={insight.id}
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      className="p-5 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleInsightAction(insight)}
                    >
                      <div className="flex items-start">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          insight.category === 'network' ? 'bg-blue-50 text-blue-600' :
                          insight.category === 'contact' ? 'bg-green-50 text-green-600' :
                          'bg-purple-50 text-purple-600'
                        } mr-4 flex-shrink-0`}>
                          {getCategoryIcon(insight.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-800">{insight.title}</h3>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getImpactColor(insight.impact)}`}
                            >
                              {insight.impact} impact
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {insight.relatedContacts?.map((contact, i) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary" 
                                  className="bg-gray-100 text-gray-800 text-xs cursor-pointer hover:bg-gray-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContactClick(contact);
                                  }}
                                >
                                  {contact}
                                </Badge>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{insight.date}</span>
                          </div>
                          
                          {insight.actionable && (
                            <Button 
                              size="sm" 
                              className="mt-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInsightAction(insight);
                              }}
                            >
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-gray-500">No insights match your criteria</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Additional Analytics Section */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-base font-medium">Insight Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-2xl text-blue-600 mb-1">8</div>
                  <div className="text-xs text-gray-600">Total Insights</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-2xl text-green-600 mb-1">3</div>
                  <div className="text-xs text-gray-600">High Impact</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-2xl text-purple-600 mb-1">6</div>
                  <div className="text-xs text-gray-600">Actionable</div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Insights by Category</h4>
                <div className="space-y-2">
                  <div className="bg-blue-50 h-2 rounded-full relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full" style={{ width: '38%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Network</span>
                    <span className="text-gray-800">38%</span>
                  </div>
                  
                  <div className="bg-green-50 h-2 rounded-full relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-green-500 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Contact</span>
                    <span className="text-gray-800">25%</span>
                  </div>
                  
                  <div className="bg-purple-50 h-2 rounded-full relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-purple-500 rounded-full" style={{ width: '37%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Activity</span>
                    <span className="text-gray-800">37%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Insights; 