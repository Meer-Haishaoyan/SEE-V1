import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Search, Calendar, TrendingUp, Heart, MessageCircle, BarChart3, UserCircle, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Contact } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

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

interface InsightsProps {
  isMobile?: boolean;
}

// 健康指标数据模型
interface HealthMetric {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'neutral';
  percentage: number;
}

// 关系聚类数据模型
interface RelationshipCluster {
  name: string;
  count: number;
  contacts: string[];
  strengths: string[];
  frequency: string;
  color: string;
}

// 互动数据模型
interface Interaction {
  contact: string;
  date: string;
  content: string;
}

// 社交目标数据模型
interface SocialGoal {
  title: string;
  description: string;
  status: 'in progress' | 'completed' | 'planned';
  progress?: number;
  timeframe: string;
  daysRemaining?: number;
}

// 建议目标数据模型
interface SuggestedGoal {
  title: string;
  description: string;
  difficulty: string;
}

const Insights = ({ isMobile = false }: InsightsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('relationships');
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
  
  // 健康指标数据
  const healthMetrics: HealthMetric[] = [
    { name: '积极互动比例', value: '72%', status: 'good', percentage: 72 },
    { name: '回复及时率', value: '48%', status: 'warning', percentage: 48 },
    { name: '关系平衡度', value: '84%', status: 'good', percentage: 84 },
    { name: '互动多样性', value: '62%', status: 'neutral', percentage: 62 }
  ];
  
  // AI建议数据
  const relationshipSuggestions: string[] = [
    '与Sarah Chen建立更深层次的专业联系可以增强您的职业网络',
    '考虑提高与David Kim家人相关互动的频率，增强家庭纽带',
    '注意您与同事Mike的互动平衡，当前处于负向状态',
    '增加与不同社交圈子的交叉互动，拓展社交网络'
  ];
  
  // 关系聚类数据
  const relationshipClusters: RelationshipCluster[] = [
    {
      name: '工作关系',
      count: 8,
      contacts: ['Mike Johnson', 'Emma Thompson', '李明', 'Alex Kim'],
      strengths: ['强', '中', '中', '弱'],
      frequency: '每周3-5次',
      color: 'rgb(59, 130, 246)'
    },
    {
      name: '家人',
      count: 6,
      contacts: ['David Kim', '张伟', 'Lisa Wang', 'James Chen'],
      strengths: ['强', '强', '中', '弱'],
      frequency: '每周2-3次',
      color: 'rgb(16, 185, 129)'
    },
    {
      name: '社交圈',
      count: 10,
      contacts: ['Sarah Chen', 'Liu Wei', 'Anna Smith', 'Tom Wilson'],
      strengths: ['强', '中', '中', '弱'],
      frequency: '每2周1-2次',
      color: 'rgb(168, 85, 247)'
    },
    {
      name: '兴趣小组',
      count: 4,
      contacts: ['John Doe', '王芳', 'Robert Lee', 'Maria Garcia'],
      strengths: ['中', '中', '弱', '弱'],
      frequency: '每月1次',
      color: 'rgb(245, 158, 11)'
    }
  ];
  
  // 最近互动数据
  const recentInteractions: Interaction[] = [
    { contact: 'Sarah Chen', date: '今天', content: '讨论项目计划和下一阶段的目标' },
    { contact: 'Mike Johnson', date: '昨天', content: '关于团队会议的跟进' },
    { contact: 'Liu Wei', date: '3天前', content: '分享行业新闻和见解' },
    { contact: 'Anna Smith', date: '上周', content: '咖啡聚会和职业讨论' },
    { contact: 'David Kim', date: '2周前', content: '家庭晚餐和近况交流' }
  ];
  
  // 社交目标数据
  const socialGoals: SocialGoal[] = [
    {
      title: '拓展专业网络',
      description: '每月至少与3位行业专业人士建立联系',
      status: 'in progress',
      progress: 65,
      timeframe: '2024年1季度',
      daysRemaining: 34
    },
    {
      title: '深化关键关系',
      description: '与5位关键联系人发展更深层次的关系',
      status: 'in progress',
      progress: 40,
      timeframe: '2024年全年',
      daysRemaining: 187
    },
    {
      title: '改善家庭互动',
      description: '每周至少有2次高质量的家庭互动',
      status: 'completed',
      progress: 100,
      timeframe: '2023年4季度'
    }
  ];
  
  // 建议目标数据
  const suggestedGoals: SuggestedGoal[] = [
    {
      title: '平衡工作关系',
      description: '提高与同事的互动质量，建立更平衡的关系',
      difficulty: '中等难度'
    },
    {
      title: '拓展社交圈',
      description: '接触新的社交圈子，每月参加至少一个社交活动',
      difficulty: '低难度'
    },
    {
      title: '提高互动频率',
      description: '与关键联系人保持更规律的沟通，增加互动频率',
      difficulty: '低难度'
    },
    {
      title: '增强多元化互动',
      description: '提高互动的多样性，不仅限于工作相关话题',
      difficulty: '中等难度'
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
    <div className="min-h-screen">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-background to-background-secondary text-white pt-12 pb-8 px-4 sm:px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/assets/pattern-light.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className={`${isMobile ? 'mobile-container' : 'max-w-4xl mx-auto'} relative`}>
          <div className="flex items-center mb-3">
            <Link to="/" className="mr-2 text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-primary">AI分析</h1>
          </div>
          <p className="text-lg font-medium text-primary/90">深入了解您的社交网络</p>
        </div>
      </motion.div>

      <div className={`${isMobile ? 'mobile-container' : 'max-w-4xl mx-auto px-6'} -mt-6`}>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="app-card mb-6"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-primary">社交网络摘要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
              <div className="bg-accent/30 p-4 rounded-lg text-center">
                <div className="text-secondary text-sm">总联系人</div>
                <div className="text-2xl font-bold text-primary mt-1">28</div>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg text-center">
                <div className="text-secondary text-sm">活跃联系人</div>
                <div className="text-2xl font-bold text-primary mt-1">14</div>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg text-center">
                <div className="text-secondary text-sm">互动总量</div>
                <div className="text-2xl font-bold text-primary mt-1">186</div>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg text-center">
                <div className="text-secondary text-sm">定期联系</div>
                <div className="text-2xl font-bold text-primary mt-1">8</div>
              </div>
            </div>
            
            <div className="bg-accent/20 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-primary mr-2" />
                <h3 className="font-medium text-primary">互动趋势</h3>
              </div>
              <div className="h-40 w-full">
                {/* Placeholder for chart */}
                <div className="w-full h-full flex items-center justify-center bg-accent/20 rounded-md">
                  <p className="text-secondary text-sm">互动趋势图表</p>
                </div>
              </div>
            </div>
          </CardContent>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab('relationships')}
              className={`pb-2 pt-1 px-4 text-sm font-medium ${
                activeTab === 'relationships' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-secondary hover:text-primary/80'
              }`}
            >
              关系分析
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`pb-2 pt-1 px-4 text-sm font-medium ${
                activeTab === 'interactions' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-secondary hover:text-primary/80'
              }`}
            >
              互动历史
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`pb-2 pt-1 px-4 text-sm font-medium ${
                activeTab === 'goals' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-secondary hover:text-primary/80'
              }`}
            >
              目标追踪
            </button>
          </div>

          {activeTab === 'relationships' && (
            <div className="space-y-6 mb-8">
              <Card className="app-card">
                <CardHeader>
                  <CardTitle className="text-base text-primary">关系健康</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-secondary">总体平衡</span>
                        <span className="text-sm font-medium text-nodePositive">良好</span>
                      </div>
                      <div className="h-2 bg-accent/30 rounded-full mb-4">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: '72%' }}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        {healthMetrics.map((metric, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-secondary">{metric.name}</span>
                              <span className={
                                metric.status === 'good' ? 'text-nodePositive' : 
                                metric.status === 'warning' ? 'text-destructive' :
                                'text-secondary'
                              }>
                                {metric.value}
                              </span>
                            </div>
                            <div className="h-1.5 bg-accent/30 rounded-full">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  metric.status === 'good' ? 'bg-nodePositive' : 
                                  metric.status === 'warning' ? 'bg-destructive' :
                                  'bg-secondary'
                                }`}
                                style={{ width: `${metric.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-accent/20 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-primary mb-3">AI建议</h4>
                      <ul className="space-y-2 text-sm">
                        {relationshipSuggestions.map((suggestion, i) => (
                          <li key={i} className="flex">
                            <div className="mr-2 mt-0.5 text-nodePositive">•</div>
                            <span className="text-secondary">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="app-card">
                <CardHeader>
                  <CardTitle className="text-base text-primary">关系图谱</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-accent/10 rounded-lg p-4 text-center h-[300px] flex items-center justify-center">
                    <p className="text-secondary">社交网络图表将在此处显示</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="app-card">
                <CardHeader>
                  <CardTitle className="text-base text-primary">关系聚类</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                    {relationshipClusters.map((cluster, i) => (
                      <div key={i} className="bg-accent/20 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: cluster.color }}
                          ></div>
                          <h4 className="text-primary font-medium">{cluster.name}</h4>
                          <Badge className="ml-2 bg-accent/50 text-secondary border-accent/30">
                            {cluster.count}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {cluster.contacts.map((contact, j) => (
                            <div key={j} className="text-sm flex justify-between">
                              <span className="text-secondary">{contact}</span>
                              <span className="text-secondary/70">{cluster.strengths[j]}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <span className="text-xs text-secondary">平均互动频率: {cluster.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-6 mb-8">
              <Card className="app-card">
                <CardHeader>
                  <CardTitle className="text-base text-primary">互动摘要</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-6`}>
                    <div className="bg-accent/30 p-3 rounded-lg text-center">
                      <div className="text-secondary text-sm">本月互动</div>
                      <div className="text-xl font-bold text-primary mt-1">24</div>
                    </div>
                    <div className="bg-accent/30 p-3 rounded-lg text-center">
                      <div className="text-secondary text-sm">平均回复</div>
                      <div className="text-xl font-bold text-primary mt-1">3.2天</div>
                    </div>
                    <div className="bg-accent/30 p-3 rounded-lg text-center">
                      <div className="text-secondary text-sm">主动互动</div>
                      <div className="text-xl font-bold text-primary mt-1">62%</div>
                    </div>
                    <div className="bg-accent/30 p-3 rounded-lg text-center">
                      <div className="text-secondary text-sm">连接率</div>
                      <div className="text-xl font-bold text-primary mt-1">87%</div>
                    </div>
                  </div>

                  <div className="bg-accent/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-primary">互动频率</h4>
                      <Badge className="bg-accent/50 text-secondary border-accent/30">过去30天</Badge>
                    </div>
                    <div className="h-40 w-full">
                      {/* Placeholder for interaction frequency chart */}
                      <div className="w-full h-full flex items-center justify-center bg-accent/10 rounded-md">
                        <p className="text-secondary text-sm">互动频率图表</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-primary">最近互动</h4>
                      <Button variant="ghost" className="text-xs h-7 text-secondary hover:text-primary">
                        查看全部
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {recentInteractions.map((interaction, i) => (
                        <div key={i} className="flex items-center p-2 rounded-lg hover:bg-accent/30 transition-colors">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback className="bg-accent/50 text-primary text-xs">
                              {interaction.contact[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-primary truncate">{interaction.contact}</p>
                              <span className="text-xs text-secondary ml-2">{interaction.date}</span>
                            </div>
                            <p className="text-xs text-secondary truncate">{interaction.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'goals' && (
            <div className="space-y-6 mb-8">
              <Card className="app-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base text-primary">社交目标</CardTitle>
                    <Button variant="ghost" size={isMobile ? "sm" : "default"} className="text-primary">
                      <Plus className="w-4 h-4 mr-1" />
                      添加目标
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {socialGoals.map((goal, i) => (
                      <div key={i} className="bg-accent/20 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-primary font-medium">{goal.title}</h4>
                          <Badge className={
                            goal.status === 'in progress' ? 'bg-nodePositive/20 text-nodePositive border-nodePositive/30' :
                            goal.status === 'completed' ? 'bg-primary/20 text-primary border-primary/30' :
                            'bg-accent/50 text-secondary border-accent/30'
                          }>
                            {goal.status === 'in progress' ? '进行中' : 
                             goal.status === 'completed' ? '已完成' : '计划中'}
                          </Badge>
                        </div>
                        <p className="text-sm text-secondary mb-3">{goal.description}</p>
                        {goal.progress !== undefined && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-secondary">进度</span>
                              <span className="text-primary">{goal.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-accent/30 rounded-full">
                              <div 
                                className="h-1.5 bg-primary rounded-full"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs text-secondary mt-2">
                          <div>{goal.timeframe}</div>
                          {goal.daysRemaining && (
                            <div>剩余 {goal.daysRemaining} 天</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="app-card">
                <CardHeader>
                  <CardTitle className="text-base text-primary">建议的目标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                    {suggestedGoals.map((goal, i) => (
                      <div key={i} className="bg-accent/20 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-primary font-medium">{goal.title}</h4>
                        </div>
                        <p className="text-sm text-secondary mb-3">{goal.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-secondary">{goal.difficulty}</div>
                          <Button variant="outline" size="sm" className="h-8 text-xs border-border bg-accent/50 text-primary">
                            添加目标
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Insights; 