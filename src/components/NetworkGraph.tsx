import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Download, ZoomIn, ZoomOut, RotateCcw, Search, Plus, Minus, ChevronLeft, Users, Activity, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Contact } from '@/types';

// Enhanced NetworkNode with group support for drill-down
interface NetworkNode extends Contact {
  x: number;
  y: number;
  radius: number;
  color: string;
  group?: string;
  subgroup?: string;
  interactionFrequency?: number;
  lastInteraction?: string;
  // For animation states
  targetX?: number;
  targetY?: number;
  targetRadius?: number;
  velocity?: { x: number, y: number };
  opacity?: number;
}

// Enhanced NetworkConnection with additional metrics
interface NetworkConnection {
  from: string;
  to: string;
  strength: number;
  balance: 'positive' | 'negative' | 'neutral';
  interactions?: number;
  lastInteraction?: string;
  trend?: 'increasing' | 'decreasing' | 'stable';
  // For animation states
  opacity?: number;
}

// Type for the view level in the drill-down navigation
type ViewLevel = 'overview' | 'group' | 'contact';

interface NetworkGraphProps {
  onBack?: () => void;
  onContactSelect: (contact: Contact) => void;
  onRelationSelect?: (connection: NetworkConnection & { fromNode: NetworkNode; toNode: NetworkNode }) => void;
  embedded?: boolean;
}

const NetworkGraph = ({ 
  onBack, 
  onContactSelect, 
  onRelationSelect,
  embedded = false 
}: NetworkGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<(NetworkConnection & { fromNode: NetworkNode; toNode: NetworkNode }) | null>(null);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  
  // New states for enhanced interactions
  const [viewLevel, setViewLevel] = useState<ViewLevel>('overview');
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [currentContact, setCurrentContact] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{level: ViewLevel, focusId?: string}>>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tooltipContent, setTooltipContent] = useState<{x: number, y: number, content: React.ReactNode} | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [dataPanelContent, setDataPanelContent] = useState<{title: string, data: any} | null>(null);
  
  // New animation-related states
  const [animatedZoomLevel, setAnimatedZoomLevel] = useState(1);
  const [targetZoomLevel, setTargetZoomLevel] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [centerOffset, setCenterOffset] = useState({x: 0, y: 0});
  const [targetCenterOffset, setTargetCenterOffset] = useState({x: 0, y: 0});
  const [showPulse, setShowPulse] = useState(true);
  const [levelOfDetail, setLevelOfDetail] = useState<'overview' | 'focused' | 'detailed'>('overview');

  // Enhanced Apple-style color scheme
  const theme = {
    // Base colors 
    bgGradient: 'rgba(11, 20, 38, 0.8)', // 深蓝色星空背景
    nodeSelf: 'rgba(255, 255, 255, 1)', // 白色主节点
    nodePositive: 'rgba(48, 209, 88, 1)', // 保持原色但更亮
    nodeNegative: 'rgba(255, 69, 58, 1)', // 保持原色但更亮
    nodeNeutral: 'rgba(208, 208, 208, 1)', // 浅灰色中性节点
    
    // Link styles with gradients
    linkPositive: 'rgba(48, 209, 88, 0.7)', // 半透明正向连接
    linkNegative: 'rgba(255, 69, 58, 0.6)', // 半透明负向连接
    linkNeutral: 'rgba(208, 208, 208, 0.4)', // 半透明中性连接
    
    // Interaction states
    nodeSelectedBorder: 'rgba(255, 255, 255, 1)', // 白色选中边框
    nodeHoverBorder: 'rgba(255, 160, 0, 1)', // 保留橙色悬停边框
    
    // Text styles
    textPrimary: 'rgba(255, 255, 255, 1)', // 白色主要文字
    textSecondary: 'rgba(208, 208, 208, 1)', // 浅灰色次要文字
    
    // Group colors - 调整为更符合星空主题的色彩
    groupFriends: 'rgba(52, 199, 89, 1)', // 绿色，朋友
    groupFamily: 'rgba(10, 132, 255, 1)', // 蓝色，家人
    groupColleagues: 'rgba(255, 149, 0, 1)', // 橙色，同事
    groupAcquaintances: 'rgba(175, 82, 222, 1)', // 紫色，熟人
  };

  // Group definitions
  const groups = [
    { id: 'friends', name: 'Friends', color: theme.groupFriends },
    { id: 'family', name: 'Family', color: theme.groupFamily },
    { id: 'colleagues', name: 'Colleagues', color: theme.groupColleagues },
    { id: 'acquaintances', name: 'Acquaintances', color: theme.groupAcquaintances }
  ];

  // Enhanced nodes with group information and interaction data
  const [nodes] = useState<NetworkNode[]>([
    { 
      id: 'you', 
      name: 'You', 
      x: 400, 
      y: 300, 
      radius: 22, 
      color: theme.nodeSelf, 
      coins: 0, 
      type: 'self',
      interactionFrequency: 0,
      lastInteraction: '2024-06-15',
      opacity: 1
    },
    { 
      id: 'sarah', 
      name: 'Sarah', 
      x: 300, 
      y: 200, 
      radius: 18, 
      color: theme.nodePositive, 
      coins: 250, 
      type: 'friend',
      group: 'friends',
      interactionFrequency: 8,
      lastInteraction: '2024-06-10',
      opacity: 1
    },
    { 
      id: 'mike', 
      name: 'Mike', 
      x: 500, 
      y: 180, 
      radius: 16, 
      color: theme.nodeNegative, 
      coins: -80, 
      type: 'colleague',
      group: 'colleagues',
      interactionFrequency: 5,
      lastInteraction: '2024-06-07',
      opacity: 1
    },
    { 
      id: 'liu', 
      name: 'Liu Wei', 
      x: 250, 
      y: 350, 
      radius: 20, 
      color: theme.nodePositive, 
      coins: 150, 
      type: 'friend',
      group: 'friends',
      interactionFrequency: 7,
      lastInteraction: '2024-06-01',
      opacity: 1
    },
    { 
      id: 'anna', 
      name: 'Anna', 
      x: 550, 
      y: 320, 
      radius: 14, 
      color: theme.groupAcquaintances, 
      coins: 45, 
      type: 'acquaintance',
      group: 'acquaintances',
      interactionFrequency: 2,
      lastInteraction: '2024-05-20',
      opacity: 1
    },
    { 
      id: 'david', 
      name: 'David', 
      x: 350, 
      y: 400, 
      radius: 17, 
      color: theme.groupFamily, 
      coins: -25, 
      type: 'family',
      group: 'family',
      interactionFrequency: 6,
      lastInteraction: '2024-06-05',
      opacity: 1
    },
    { 
      id: 'emma', 
      name: 'Emma', 
      x: 480, 
      y: 250, 
      radius: 15, 
      color: theme.groupColleagues, 
      coins: 90, 
      type: 'colleague',
      group: 'colleagues',
      interactionFrequency: 4,
      lastInteraction: '2024-06-08',
      opacity: 1
    },
    // Add more nodes for each group to have a richer visualization
    { 
      id: 'john', 
      name: 'John', 
      x: 280, 
      y: 150, 
      radius: 16, 
      color: theme.groupFriends, 
      coins: 60, 
      type: 'friend',
      group: 'friends',
      interactionFrequency: 3,
      lastInteraction: '2024-05-25',
      opacity: 1
    },
    { 
      id: 'alice', 
      name: 'Alice', 
      x: 180, 
      y: 280, 
      radius: 15, 
      color: theme.groupFamily, 
      coins: 120, 
      type: 'family',
      group: 'family',
      interactionFrequency: 9,
      lastInteraction: '2024-06-12',
      opacity: 1
    },
    { 
      id: 'robert', 
      name: 'Robert', 
      x: 450, 
      y: 150, 
      radius: 14, 
      color: theme.groupColleagues, 
      coins: -45, 
      type: 'colleague',
      group: 'colleagues',
      interactionFrequency: 4,
      lastInteraction: '2024-05-30',
      opacity: 1
    }
  ]);

  // Enhanced connections with interaction data and trends
  const [connections] = useState<NetworkConnection[]>([
    { 
      from: 'you', 
      to: 'sarah', 
      strength: 0.8, 
      balance: 'positive',
      interactions: 12,
      lastInteraction: '2024-06-10',
      trend: 'increasing',
      opacity: 1
    },
    { 
      from: 'you', 
      to: 'mike', 
      strength: 0.6, 
      balance: 'negative',
      interactions: 8,
      lastInteraction: '2024-06-07',
      trend: 'stable',
      opacity: 1
    },
    { 
      from: 'you', 
      to: 'liu', 
      strength: 0.7, 
      balance: 'positive',
      interactions: 10,
      lastInteraction: '2024-06-01',
      trend: 'stable',
      opacity: 1
    },
    { 
      from: 'you', 
      to: 'anna', 
      strength: 0.4, 
      balance: 'neutral',
      interactions: 4,
      lastInteraction: '2024-05-20',
      trend: 'decreasing',
      opacity: 1
    },
    { 
      from: 'you', 
      to: 'david', 
      strength: 0.9, 
      balance: 'neutral',
      interactions: 15,
      lastInteraction: '2024-06-05',
      trend: 'increasing',
      opacity: 1
    },
    { 
      from: 'you', 
      to: 'emma', 
      strength: 0.5, 
      balance: 'positive',
      interactions: 7,
      lastInteraction: '2024-06-08',
      trend: 'stable',
      opacity: 1
    },
    { 
      from: 'sarah', 
      to: 'mike', 
      strength: 0.3, 
      balance: 'neutral',
      interactions: 3,
      lastInteraction: '2024-05-15',
      trend: 'decreasing',
      opacity: 1
    },
    { 
      from: 'liu', 
      to: 'david', 
      strength: 0.6, 
      balance: 'positive',
      interactions: 8,
      lastInteraction: '2024-05-28',
      trend: 'increasing',
      opacity: 1
    },
    { 
      from: 'you', 
      to: 'john', 
      strength: 0.5, 
      balance: 'positive',
      interactions: 6,
      lastInteraction: '2024-05-25',
      trend: 'stable',
      opacity: 1
    },
    { 
      from: 'you', 
      to: 'alice', 
      strength: 0.7, 
      balance: 'positive',
      interactions: 12,
      lastInteraction: '2024-06-12',
      trend: 'increasing',
      opacity: 1
    },
    { 
      from: 'you', 
      to: 'robert', 
      strength: 0.4, 
      balance: 'negative',
      interactions: 5,
      lastInteraction: '2024-05-30',
      trend: 'decreasing',
      opacity: 1
    },
    // Add some inter-group connections
    { 
      from: 'sarah', 
      to: 'liu', 
      strength: 0.3, 
      balance: 'positive',
      interactions: 4,
      lastInteraction: '2024-05-22',
      trend: 'stable',
      opacity: 1
    },
    { 
      from: 'mike', 
      to: 'emma', 
      strength: 0.5, 
      balance: 'neutral',
      interactions: 7,
      lastInteraction: '2024-05-27',
      trend: 'stable',
      opacity: 1
    },
    { 
      from: 'david', 
      to: 'alice', 
      strength: 0.8, 
      balance: 'positive',
      interactions: 10,
      lastInteraction: '2024-06-08',
      trend: 'increasing',
      opacity: 1
    }
  ]);

  // Get visible connections based on the current view level
  const getVisibleConnections = () => {
    if (viewLevel === 'overview') {
      // In overview, show all connections with proper opacity
      return connections.map(conn => ({
        ...conn,
        opacity: 1
      }));
    } else if (viewLevel === 'group' && currentGroup) {
      // In group view, show connections between nodes in the current group and connections to "you"
      const groupNodes = nodes.filter(node => node.group === currentGroup || node.id === 'you');
      const groupNodeIds = new Set(groupNodes.map(node => node.id));
      
      return connections.filter(conn => 
        (groupNodeIds.has(conn.from) && groupNodeIds.has(conn.to))
      ).map(conn => ({
        ...conn,
        opacity: 1
      }));
    } else if (viewLevel === 'contact' && currentContact) {
      // In contact view, only show connections related to the current contact
      return connections.filter(conn => 
        conn.from === currentContact || conn.to === currentContact
      ).map(conn => ({
        ...conn,
        opacity: 1
      }));
    }

    // Default: if focused node, show connections to that node
    if (focusedNode) {
      return connections.filter(conn => 
        conn.from === focusedNode || conn.to === focusedNode
      );
    }
    return connections;
  };

  // Get visible nodes based on the current view level
  const getVisibleNodes = () => {
    if (viewLevel === 'overview') {
      // In overview mode, we collapse nodes by group
      if (levelOfDetail === 'overview') {
        // Generate group nodes
        const groupNodes: NetworkNode[] = groups.map(group => {
          // Find nodes in this group
          const groupMembers = nodes.filter(node => node.group === group.id);
          
          // Calculate average position
          const avgX = groupMembers.reduce((sum, node) => sum + node.x, 0) / Math.max(1, groupMembers.length);
          const avgY = groupMembers.reduce((sum, node) => sum + node.y, 0) / Math.max(1, groupMembers.length);
          
          // Calculate radius based on number of members
          const radius = Math.min(30, 15 + groupMembers.length * 2);
          
          return {
            id: `group_${group.id}`,
            name: group.name,
            x: avgX,
            y: avgY,
            radius: radius,
            color: group.color,
            coins: groupMembers.reduce((sum, node) => sum + node.coins, 0),
            type: 'friend' as const,
            opacity: 1,
            // Additional data for groups
            interactionFrequency: groupMembers.reduce((sum, node) => sum + (node.interactionFrequency || 0), 0),
            group: group.id
          };
        });
        
        // Always include "you" node
        const youNode = nodes.find(node => node.id === 'you');
        
        return youNode ? [...groupNodes, youNode] : groupNodes;
      }
      
      return nodes;
    } else if (viewLevel === 'group' && currentGroup) {
      // In group view, show only nodes from the current group and the "you" node
      return nodes.filter(node => node.group === currentGroup || node.id === 'you').map(node => ({
        ...node,
        opacity: 1
      }));
    } else if (viewLevel === 'contact' && currentContact) {
      // Get the connections for this contact
      const relevantConnections = connections.filter(conn => 
        conn.from === currentContact || conn.to === currentContact
      );
      
      // Get IDs of connected nodes
      const connectedNodeIds = new Set<string>();
      relevantConnections.forEach(conn => {
        connectedNodeIds.add(conn.from);
        connectedNodeIds.add(conn.to);
      });
      
      // Return the current contact and connected nodes
      return nodes.filter(node => connectedNodeIds.has(node.id)).map(node => ({
        ...node,
        opacity: node.id === currentContact ? 1 : 0.7
      }));
    }

    // Default: if focused node exists, show connected nodes
    if (focusedNode) {
      const visibleConnections = getVisibleConnections();
      const visibleNodeIds = new Set([focusedNode]);
      
      visibleConnections.forEach(conn => {
        visibleNodeIds.add(conn.from);
        visibleNodeIds.add(conn.to);
      });
      
      return nodes.filter(node => visibleNodeIds.has(node.id));
    }
    
    return nodes;
  };
  
  // Helper to get simplified group information
  const getGroupSummary = (groupId: string) => {
    const groupMembers = nodes.filter(node => node.group === groupId);
    const totalCoins = groupMembers.reduce((sum, node) => sum + node.coins, 0);
    const totalInteractions = groupMembers.reduce((sum, node) => sum + (node.interactionFrequency || 0), 0);
    
    // Find most recent interaction
    const lastInteraction = groupMembers.reduce((latest, node) => {
      if (!node.lastInteraction) return latest;
      return !latest || new Date(node.lastInteraction) > new Date(latest)
        ? node.lastInteraction 
        : latest;
    }, '');
    
    return {
      id: groupId,
      name: groups.find(g => g.id === groupId)?.name || groupId,
      memberCount: groupMembers.length,
      totalCoins,
      totalInteractions,
      lastInteraction,
      members: groupMembers
    };
  };

  // Navigate to a specific view level
  const navigateTo = (level: ViewLevel, id?: string) => {
    // Save current state to history
    setNavigationHistory(prev => [
      ...prev, 
      { 
        level: viewLevel, 
        focusId: level === 'overview' ? undefined : (viewLevel === 'group' ? currentGroup : currentContact) 
      }
    ]);
    
    // Set animation flag
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
    
    // Update view level
    setViewLevel(level);
    
    if (level === 'group') {
      setCurrentGroup(id || null);
      setCurrentContact(null);
    } else if (level === 'contact') {
      setCurrentContact(id || null);
    } else {
      setCurrentGroup(null);
      setCurrentContact(null);
    }
    
    // Reset zoom and position with animation
    setTargetZoomLevel(1);
    setTargetCenterOffset({x: 0, y: 0});
  };
  
  // Go back to previous view
  const navigateBack = () => {
    if (navigationHistory.length === 0) {
      onBack?.();
      return;
    }
    
    // Get last navigation state
    const lastNavigation = navigationHistory[navigationHistory.length - 1];
    
    // Remove from history
    setNavigationHistory(prev => prev.slice(0, -1));
    
    // Navigate to previous level
    setViewLevel(lastNavigation.level);
    
    if (lastNavigation.level === 'group') {
      setCurrentGroup(lastNavigation.focusId || null);
      setCurrentContact(null);
    } else if (lastNavigation.level === 'contact') {
      setCurrentContact(lastNavigation.focusId || null);
    } else {
      setCurrentGroup(null);
      setCurrentContact(null);
    }
    
    // Reset zoom and position with animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
    setTargetZoomLevel(1);
    setTargetCenterOffset({x: 0, y: 0});
  };

  const findNodeAt = (x: number, y: number): NetworkNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    // Apply zoom and pan transformations
    const adjustedX = (x - centerOffset.x) / zoomLevel;
    const adjustedY = (y - centerOffset.y) / zoomLevel;

    const visibleNodes = getVisibleNodes();
    
    // Check if any node is at the clicked position
    for (let i = visibleNodes.length - 1; i >= 0; i--) {
      const node = visibleNodes[i];
      const distance = Math.sqrt((adjustedX - node.x) ** 2 + (adjustedY - node.y) ** 2);
      if (distance <= node.radius * zoomLevel) {
        return node;
      }
    }
    
    return null;
  };

  const findConnectionAt = (x: number, y: number): (NetworkConnection & { fromNode: NetworkNode; toNode: NetworkNode }) | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Apply zoom and pan transformations
    const adjustedX = (x - centerOffset.x) / zoomLevel;
    const adjustedY = (y - centerOffset.y) / zoomLevel;
    
    const visibleConnections = getVisibleConnections();
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    // Check if any connection is near the click position
    for (const conn of visibleConnections) {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      
      if (!fromNode || !toNode) continue;
      
      // Calculate the shortest distance from point to line segment
      const lineLength = Math.sqrt(Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2));
      if (lineLength === 0) continue;
      
      const t = ((adjustedX - fromNode.x) * (toNode.x - fromNode.x) + (adjustedY - fromNode.y) * (toNode.y - fromNode.y)) / Math.pow(lineLength, 2);
      
      if (t < 0) {
        // The nearest point is the start point
        const distance = Math.sqrt(Math.pow(adjustedX - fromNode.x, 2) + Math.pow(adjustedY - fromNode.y, 2));
        if (distance < 10) {
          return { ...conn, fromNode, toNode };
        }
      } else if (t > 1) {
        // The nearest point is the end point
        const distance = Math.sqrt(Math.pow(adjustedX - toNode.x, 2) + Math.pow(adjustedY - toNode.y, 2));
        if (distance < 10) {
          return { ...conn, fromNode, toNode };
        }
      } else {
        // The nearest point is on the line segment
        const projectionX = fromNode.x + t * (toNode.x - fromNode.x);
        const projectionY = fromNode.y + t * (toNode.y - fromNode.y);
        const distance = Math.sqrt(Math.pow(adjustedX - projectionX, 2) + Math.pow(adjustedY - projectionY, 2));
        
        // Check if distance is less than threshold (considering line thickness)
        const threshold = Math.max(5, conn.strength * 3);
        if (distance < threshold) {
          return { ...conn, fromNode, toNode };
        }
      }
    }
    
    return null;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const visibleNodes = getVisibleNodes();
    const visibleConnections = getVisibleConnections();
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    // Set canvas DPI for high-resolution displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (embedded) {
      canvas.width = rect.width * dpr;
      canvas.height = 300 * dpr;
    } else {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(centerOffset.x, centerOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Animate zoom if needed
    if (zoomLevel !== targetZoomLevel) {
      const zoomDiff = targetZoomLevel - zoomLevel;
      setZoomLevel(zoomLevel + zoomDiff * 0.1);
    }

    // Animate pan if needed
    if (centerOffset.x !== targetCenterOffset.x || centerOffset.y !== targetCenterOffset.y) {
      const xDiff = targetCenterOffset.x - centerOffset.x;
      const yDiff = targetCenterOffset.y - centerOffset.y;
      setCenterOffset({
        x: centerOffset.x + xDiff * 0.1,
        y: centerOffset.y + yDiff * 0.1
      });
    }

    // 星空背景效果 - 适配深蓝色星空主题
    if (!embedded) {
      ctx.save();
      const canvasWidth = canvas.width / (dpr * zoomLevel);
      const canvasHeight = canvas.height / (dpr * zoomLevel);
      const centerX = canvasWidth / 2 - centerOffset.x / zoomLevel;
      const centerY = canvasHeight / 2 - centerOffset.y / zoomLevel;
      
      // 渐变背景
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(canvasWidth, canvasHeight) / 1.5
      );
      gradient.addColorStop(0, 'rgba(16, 30, 54, 0.3)'); // #101E36
      gradient.addColorStop(1, 'rgba(11, 20, 38, 0.2)'); // #0B1426
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        -centerOffset.x / zoomLevel, 
        -centerOffset.y / zoomLevel, 
        canvasWidth, canvasHeight
      );
      
      // 画星星点缀
      const now = Date.now();
      const starCount = Math.min(150, Math.max(80, Math.floor(canvasWidth * canvasHeight / 10000)));
      
      for (let i = 0; i < starCount; i++) {
        // 使用伪随机函数以确保星星位置稳定
        const pseudoRandom = (i * 9301 + 49297) % 233280;
        const random = pseudoRandom / 233280;
        
        const x = canvasWidth * (i % 17) / 17 - centerOffset.x / zoomLevel;
        const y = canvasHeight * Math.floor(i / 17) / Math.ceil(starCount / 17) - centerOffset.y / zoomLevel;
        
        const offsetX = Math.sin((now + i * 100) / 3000) * 10;
        const offsetY = Math.cos((now + i * 100) / 5000) * 10;
        
        const finalX = x + offsetX;
        const finalY = y + offsetY;
        
        // 不同大小和透明度的星星
        const size = 0.5 + random * 1;
        const alpha = 0.2 + random * 0.8;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(finalX, finalY, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }

    // Draw connections with enhanced styling and animations
    visibleConnections.forEach(conn => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      
      if (fromNode && toNode) {
        const opacity = conn.opacity !== undefined ? conn.opacity : 1;
        
        // Main connection line
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        
        // Use curved lines for a more organic feel
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        const curveFactor = Math.min(0.2, Math.max(0.1, conn.strength * 0.15));
        
        // Add slight curve for visual interest
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate curve control point
        const perpX = -dy / dist * 20;
        const perpY = dx / dist * 20;
        
        // Adjust curve direction based on relationship balance
        const curveMultiplier = conn.balance === 'positive' ? 1 : 
                             conn.balance === 'negative' ? -1 : 0;
        
        const ctrlX = midX + perpX * curveMultiplier;
        const ctrlY = midY + perpY * curveMultiplier;
        
        // Draw curved line
        ctx.quadraticCurveTo(ctrlX, ctrlY, toNode.x, toNode.y);
        
        // Set line style based on relationship balance and states
        const isHovered = hoveredConnection && 
          (hoveredConnection.from === conn.from && hoveredConnection.to === conn.to);
        
        // Dynamic line width based on connection strength and hover state
        ctx.lineWidth = (isHovered ? conn.strength * 8 : conn.strength * 4);
        
        // Get connection color with proper opacity
        const getConnColor = (baseColor: string) => {
          const baseRgba = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (baseRgba) {
            return `rgba(${baseRgba[1]}, ${baseRgba[2]}, ${baseRgba[3]}, ${opacity * (isHovered ? 0.9 : 0.7)})`;
          }
          return baseColor;
        };
        
        ctx.strokeStyle = conn.balance === 'positive' ? getConnColor(theme.linkPositive) : 
                         conn.balance === 'negative' ? getConnColor(theme.linkNegative) : 
                         getConnColor(theme.linkNeutral);
        
        // Add blur effect for highlighted connections
        if (isHovered) {
          ctx.shadowColor = conn.balance === 'positive' ? 'rgba(48, 209, 88, 0.8)' : 
                           conn.balance === 'negative' ? 'rgba(255, 69, 58, 0.8)' : 'rgba(142, 142, 147, 0.6)';
          ctx.shadowBlur = 10;
        }
        
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Draw direction indicator (only in detailed views)
        if (viewLevel !== 'overview' || levelOfDetail !== 'overview') {
          // Direction indicator position
          const indicatorPos = 0.7; // 70% along the line
          const ix = fromNode.x + (toNode.x - fromNode.x) * indicatorPos;
          const iy = fromNode.y + (toNode.y - fromNode.y) * indicatorPos;
          
          // Get position along the curve
          const t = indicatorPos;
          const qx = fromNode.x + (ctrlX - fromNode.x) * t;
          const qy = fromNode.y + (ctrlY - fromNode.y) * t;
          const indicatorX = qx + (ctrlX + (toNode.x - ctrlX) * t - qx) * t;
          const indicatorY = qy + (ctrlY + (toNode.y - ctrlY) * t - qy) * t;
          
          // Calculate angle for direction
          const angle = Math.atan2(
            toNode.y - fromNode.y,
            toNode.x - fromNode.x
          );
          
          // Draw direction indicator
          ctx.save();
          ctx.translate(indicatorX, indicatorY);
          ctx.rotate(angle);
          
          // Arrow-like indicator
          ctx.beginPath();
          const arrowSize = Math.max(4, conn.strength * 5);
          ctx.moveTo(0, 0);
          ctx.lineTo(-arrowSize, -arrowSize/2);
          ctx.lineTo(-arrowSize * 0.7, 0);
          ctx.lineTo(-arrowSize, arrowSize/2);
          ctx.closePath();
          
          // Fill with color based on relationship
          const arrowColor = conn.balance === 'positive' ? theme.nodePositive : 
                            conn.balance === 'negative' ? theme.nodeNegative : theme.nodeNeutral;
          ctx.fillStyle = arrowColor;
          ctx.globalAlpha = opacity * 0.9;
          ctx.fill();
          ctx.globalAlpha = 1;
          
          // Add pulse effect for "increasing" trend connections
          if (conn.trend === 'increasing' && !isAnimating) {
            const now = Date.now();
            const pulseSize = Math.sin(now / 500) * 0.3 + 0.7;
            
            ctx.beginPath();
            ctx.arc(0, 0, arrowSize * 1.5 * pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = `${arrowColor}33`;
            ctx.fill();
          }
          
          ctx.restore();
        }
        
        // Add interaction count indicator in detailed view
        if ((viewLevel === 'contact' || levelOfDetail === 'detailed') && conn.interactions) {
          const centerX = (fromNode.x + toNode.x) / 2;
          const centerY = (fromNode.y + toNode.y) / 2;
          
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = theme.textPrimary;
          ctx.fillText(conn.interactions.toString(), centerX, centerY);
          ctx.restore();
        }
      }
    });

    // Draw nodes with enhanced styling and animations
    visibleNodes.forEach(node => {
      const opacity = node.opacity !== undefined ? node.opacity : 1;
      
      // Skip fully transparent nodes
      if (opacity <= 0.05) return;
      
      ctx.globalAlpha = opacity;
      
      // Add blur effect for the main focused node
      if ((currentContact && node.id === currentContact) || 
          (viewLevel === 'group' && node.id === 'you')) {
        ctx.shadowColor = 'rgba(0, 122, 255, 0.5)';
        ctx.shadowBlur = 15;
      }
      
      // Draw selection/hover indicators
      if (selectedNode?.id === node.id || hoveredNode?.id === node.id) {
        // Larger selection glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = selectedNode?.id === node.id 
          ? 'rgba(0, 122, 255, 0.15)' 
          : 'rgba(255, 159, 10, 0.15)';
        ctx.fill();
        
        // Medium selection ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = selectedNode?.id === node.id 
          ? 'rgba(0, 122, 255, 0.2)' 
          : 'rgba(255, 159, 10, 0.2)';
        ctx.fill();
        
        // Outer selection border
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = selectedNode?.id === node.id 
          ? theme.nodeSelectedBorder 
          : theme.nodeHoverBorder;
        ctx.stroke();
      }
      
      // Add pulse effect for active nodes
      if (showPulse && (
           node.id === 'you' || 
           node.coins > 100 || 
           node.id === currentContact ||
           (node.id.startsWith('group_') && !isAnimating)
         )) {
        // Use time-based animation
        const now = Date.now();
        const pulseSize = Math.sin(now / 1000) * 0.2 + 1.3;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}22`;
        ctx.fill();
      }
      
      // Node main circle with gradient effect
      const gradient = ctx.createRadialGradient(
        node.x - node.radius * 0.3, 
        node.y - node.radius * 0.3,
        0,
        node.x,
        node.y,
        node.radius * 1.2
      );
      
      // Apple-style gradient
      gradient.addColorStop(0, node.color);
      gradient.addColorStop(1, adjustColor(node.color, -20)); // Slightly darker
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add subtle inner highlight for 3D effect
      ctx.beginPath();
      ctx.arc(
        node.x - node.radius * 0.15,
        node.y - node.radius * 0.15,
        node.radius * 0.7, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = `${adjustColor(node.color, 30)}77`; // Lighter with transparency
      ctx.fill();
      
      // For group nodes in overview, show member count badge
      if (node.id.startsWith('group_') && viewLevel === 'overview') {
        const groupId = node.id.replace('group_', '');
        const memberCount = nodes.filter(n => n.group === groupId).length;
        
        // Draw badge in top right of node
        const badgeX = node.x + node.radius * 0.7;
        const badgeY = node.y - node.radius * 0.7;
        const badgeSize = Math.max(14, Math.min(node.radius * 0.8, 18));
        
        // Badge circle
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        
        // Badge text
        ctx.font = `bold ${Math.max(9, Math.min(11, badgeSize * 0.6))}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = theme.textPrimary;
        ctx.fillText(memberCount.toString(), badgeX, badgeY);
      }
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Draw label for nodes based on detail level and state
      const shouldShowLabel = 
        viewLevel !== 'overview' || 
        levelOfDetail !== 'overview' || 
        node.id === 'you' || 
        node.radius > 15 || 
        hoveredNode?.id === node.id || 
        selectedNode?.id === node.id ||
        node.id.startsWith('group_');
      
      if (shouldShowLabel) {
        const fontSize = Math.max(10, Math.min(14, node.radius * 0.7));
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        
        // Create slight text stroke for better readability
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        
        // Draw name
        ctx.strokeText(node.name, node.x, node.y);
        ctx.fillText(node.name, node.x, node.y);
        
        // Show coins/value below name in detailed view
        if (viewLevel !== 'overview' || levelOfDetail === 'detailed') {
          ctx.font = `${fontSize * 0.8}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillStyle = node.coins >= 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 220, 220, 0.9)';
          
          // Format coins with + or - prefix
          const coinsText = (node.coins > 0 ? '+' : '') + node.coins;
          ctx.strokeText(coinsText, node.x, node.y + fontSize * 1.2);
          ctx.fillText(coinsText, node.x, node.y + fontSize * 1.2);
        }
      }
      
      ctx.globalAlpha = 1;
    });
    
    // Restore context
    ctx.restore();
  };
  
  // Helper to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    // Parse rgba format
    const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgba) {
      let r = parseInt(rgba[1]) + amount;
      let g = parseInt(rgba[2]) + amount;
      let b = parseInt(rgba[3]) + amount;
      
      r = Math.min(Math.max(0, r), 255);
      g = Math.min(Math.max(0, g), 255);
      b = Math.min(Math.max(0, b), 255);
      
      const a = rgba[4] ? parseFloat(rgba[4]) : 1;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    
    return color;
  };

  // Event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      
      if (embedded) {
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = '300px';
      } else {
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
      
      draw();
    };
    
    // Initialize size and draw
    handleResize();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseDrag);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    // Animation loop for effects
    let animationFrameId: number;
    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseOut);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseDrag);
      canvas.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, [zoomLevel, centerOffset, hoveredNode, selectedNode, hoveredConnection, focusedNode, levelOfDetail, showPulse]);
  
  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check for node hover
    const node = findNodeAt(x, y);
    
    // Update tooltip if hovering over a node
    if (node) {
      setHoveredNode(node);
      
      // Show tooltip for group nodes or in detailed view
      if ((node.id.startsWith('group_') && viewLevel === 'overview') || 
          (viewLevel !== 'overview' && levelOfDetail === 'detailed')) {
        
        // Calculate tooltip content based on node type
        let tooltipNode: React.ReactNode;
        
        if (node.id.startsWith('group_')) {
          const groupId = node.id.replace('group_', '');
          const groupInfo = getGroupSummary(groupId);
          
          tooltipNode = (
            <div className="p-2 rounded-[12px] bg-card/90 backdrop-blur-md shadow-lg border border-border text-sm">
              <div className="font-bold text-primary">{groupInfo.name}</div>
              <div className="text-secondary">成员: {groupInfo.memberCount}</div>
              <div className="text-secondary">平衡: {groupInfo.totalCoins > 0 ? '+' : ''}{groupInfo.totalCoins}</div>
              {groupInfo.lastInteraction && (
                <div className="text-secondary">最后互动: {new Date(groupInfo.lastInteraction).toLocaleDateString()}</div>
              )}
            </div>
          );
        } else {
          // Individual node tooltip
          tooltipNode = (
            <div className="p-2 rounded-[12px] bg-card/90 backdrop-blur-md shadow-lg border border-border text-sm">
              <div className="font-bold text-primary">{node.name}</div>
              <div className="text-secondary">类型: {node.type}</div>
              <div className="text-secondary">平衡: {node.coins > 0 ? '+' : ''}{node.coins}</div>
              {node.lastInteraction && (
                <div className="text-secondary">最后互动: {new Date(node.lastInteraction).toLocaleDateString()}</div>
              )}
            </div>
          );
        }
        
        // Position tooltip near node but avoid edges
        const tooltipX = Math.min(rect.width - 200, Math.max(10, x));
        const tooltipY = Math.min(rect.height - 100, Math.max(10, y - 30));
        
        setTooltipContent({ 
          x: tooltipX, 
          y: tooltipY, 
          content: tooltipNode 
        });
      } else {
        setTooltipContent(null);
      }
      
      // Update cursor style for nodes
      if (node.id.startsWith('group_') || (viewLevel === 'group' && node.id !== 'you')) {
        canvasRef.current!.style.cursor = 'pointer';
      } else {
        canvasRef.current!.style.cursor = 'pointer';
      }
      
      setHoveredConnection(null);
      return;
    }
    
    // Reset node hover state if not hovering any node
    setHoveredNode(null);
    setTooltipContent(null);
    
    // Check for connection hover if not hovering over a node
    const connection = findConnectionAt(x, y);
          if (connection) {
        setHoveredConnection(connection);
        canvasRef.current!.style.cursor = 'pointer';
        
        // Show connection tooltip in detailed view
      if (levelOfDetail === 'detailed' || viewLevel === 'contact') {
        const tooltipNode = (
          <div className="p-2 rounded-[12px] bg-card/90 backdrop-blur-md shadow-lg border border-border text-sm">
            <div className="font-bold text-primary">连接</div>
            <div className="text-secondary">从: {connection.fromNode.name}</div>
            <div className="text-secondary">到: {connection.toNode.name}</div>
            <div className="text-secondary">强度: {Math.round(connection.strength * 10)}</div>
            <div className="text-secondary">平衡: {
              connection.balance === 'positive' ? '正向' : 
              connection.balance === 'negative' ? '负向' : '中性'
            }</div>
            {connection.interactions && (
              <div className="text-secondary">交互: {connection.interactions}</div>
            )}
            {connection.trend && (
              <div className="text-secondary">趋势: {
                connection.trend === 'increasing' ? '增长' : 
                connection.trend === 'decreasing' ? '下降' : '稳定'
              }</div>
            )}
          </div>
        );
        
        setTooltipContent({
          x: x + 15,
          y: y + 15,
          content: tooltipNode
        });
      }
    } else {
      setHoveredConnection(null);
      canvasRef.current!.style.cursor = dragStart ? 'grabbing' : 'grab';
    }
  };
  
  const handleMouseOut = () => {
    setHoveredNode(null);
    setHoveredConnection(null);
    setTooltipContent(null);
  };
  
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    
    if (dragStart) return; // Don't register as click if we were dragging
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check for node click
    const node = findNodeAt(x, y);
    
    if (node) {
      // Check if clicking on a group node for drill-down
      if (node.id.startsWith('group_') && viewLevel === 'overview') {
        const groupId = node.id.replace('group_', '');
        navigateTo('group', groupId);
        return;
      }
      
      // Check if selecting a contact node
      if (viewLevel === 'group' && node.id !== 'you') {
        navigateTo('contact', node.id);
        return;
      }
      
      // Regular node selection behavior
      if (node.id === selectedNode?.id) {
        setSelectedNode(null);
      } else {
        setSelectedNode(node);
        
        if (node.id !== 'you') {
          onContactSelect(node);
        }
      }
      
      // Handle focus toggle
      if (node.id === focusedNode) {
        setFocusedNode(null);
      }
      return;
    }
    
    // Check for connection click
    const connection = findConnectionAt(x, y);
    if (connection && onRelationSelect) {
      onRelationSelect(connection);
      return;
    }
    
    // Reset selected node if clicking elsewhere
    setSelectedNode(null);
  };
  
  const handleMouseDown = (e: MouseEvent) => {
    setDragStart({
      x: e.clientX - centerOffset.x,
      y: e.clientY - centerOffset.y
    });
  };
  
  const handleMouseUp = () => {
    setDragStart(null);
  };
  
  const handleMouseDrag = (e: MouseEvent) => {
    if (dragStart) {
      setCenterOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    // Get canvas dimensions
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate mouse position in world space before zoom
    const worldX = (mouseX - centerOffset.x) / zoomLevel;
    const worldY = (mouseY - centerOffset.y) / zoomLevel;
    
    // Calculate new zoom level
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newZoomLevel = Math.min(Math.max(zoomLevel + delta, 0.5), 2);
    
    // Set new zoom level
    setZoomLevel(newZoomLevel);
    
    // Calculate new screen position of mouse after zoom
    const newScreenX = worldX * newZoomLevel + centerOffset.x;
    const newScreenY = worldY * newZoomLevel + centerOffset.y;
    
    // Calculate required pan amount
    const panX = mouseX - newScreenX;
    const panY = mouseY - newScreenY;
    
    // Apply pan
    setCenterOffset({
      x: centerOffset.x + panX,
      y: centerOffset.y + panY
    });
  };
  
  const handleShare = () => {
    toast("Link to network copied to clipboard", {
      icon: "📋"
    });
  };
  
  const resetView = () => {
    setZoomLevel(1);
    setCenterOffset({x: 0, y: 0});
    setFocusedNode(null);
    setSelectedNode(null);
    setLevelOfDetail('overview');
  };
  
  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.1, 2));
  };
  
  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.1, 0.5));
  };
  
  const toggleDetailLevel = () => {
    const levels: ('overview' | 'focused' | 'detailed')[] = ['overview', 'focused', 'detailed'];
    const currentIndex = levels.indexOf(levelOfDetail);
    const nextIndex = (currentIndex + 1) % levels.length;
    setLevelOfDetail(levels[nextIndex]);
  };

  const handleBack = () => {
    if (viewLevel === 'overview') {
      onBack?.();
    } else {
      navigateBack();
    }
  };
  
  const toggleDataPanel = () => {
    setShowDataPanel(!showDataPanel);
    
    // Populate data panel content
    if (!showDataPanel) {
      let title = 'Network Overview';
      let data: any = {
        totalContacts: nodes.filter(n => n.id !== 'you').length,
        totalInteractions: connections.reduce((sum, conn) => sum + (conn.interactions || 0), 0),
        positiveBalance: nodes.filter(n => n.coins > 0).length,
        negativeBalance: nodes.filter(n => n.coins < 0).length,
      };
      
      // Group-specific data
      if (viewLevel === 'group' && currentGroup) {
        const groupInfo = getGroupSummary(currentGroup);
        title = `${groupInfo.name} Group`;
        data = {
          ...groupInfo,
          averageInteractionFrequency: groupInfo.totalInteractions / Math.max(1, groupInfo.memberCount),
        };
      } 
      // Contact-specific data
      else if (viewLevel === 'contact' && currentContact) {
        const contact = nodes.find(n => n.id === currentContact);
        if (contact) {
          title = `${contact.name} Details`;
          
          // Get connections for this contact
          const contactConnections = connections.filter(
            conn => conn.from === contact.id || conn.to === contact.id
          );
          
          data = {
            contact,
            connectionCount: contactConnections.length,
            totalInteractions: contactConnections.reduce((sum, conn) => sum + (conn.interactions || 0), 0),
            contacts: contactConnections.map(conn => {
              const otherId = conn.from === contact.id ? conn.to : conn.from;
              const other = nodes.find(n => n.id === otherId);
              return {
                name: other?.name,
                type: other?.type,
                strength: conn.strength,
                balance: conn.balance,
                lastInteraction: conn.lastInteraction
              };
            })
          };
        }
      }
      
      setDataPanelContent({ title, data });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Top navigation bar with breadcrumb and controls */}
      {!embedded && (
        <div className="absolute top-6 left-6 z-10 flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-card/90 backdrop-blur-md shadow-sm border-border hover:bg-card/100 text-foreground"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Breadcrumb navigation */}
          <div className="flex items-center h-9 px-3 rounded-[12px] bg-card/90 backdrop-blur-md shadow-sm border border-border">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`breadcrumb-${viewLevel}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center text-sm font-medium text-secondary"
              >
                <span 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => navigateTo('overview')}
                >
                  网络
                </span>
                
                {viewLevel === 'group' && currentGroup && (
                  <>
                    <ChevronLeft className="h-3 w-3 mx-1 text-muted" />
                    <span className="text-primary">
                      {groups.find(g => g.id === currentGroup)?.name || '群组'}
                    </span>
                  </>
                )}
                
                {viewLevel === 'contact' && currentContact && (
                  <>
                    <ChevronLeft className="h-3 w-3 mx-1 text-muted" />
                    {currentGroup && (
                      <span 
                        className="cursor-pointer hover:text-primary mr-1"
                        onClick={() => navigateTo('group', currentGroup)}
                      >
                        {groups.find(g => g.id === currentGroup)?.name || '群组'}
                      </span>
                    )}
                    <ChevronLeft className="h-3 w-3 mx-1 text-muted" />
                    <span className="text-primary">
                      {nodes.find(n => n.id === currentContact)?.name || '联系人'}
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex-1" />
          
          <Button
            variant="outline"
            size="icon"
            className="bg-card/90 backdrop-blur-md shadow-sm border-border hover:bg-card/100 text-foreground"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card/90 backdrop-blur-md shadow-sm border-border hover:bg-card/100 text-foreground"
            onClick={() => {}}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Zoom controls */}
      {!embedded && (
        <div className="absolute bottom-6 right-6 z-10 flex flex-col space-y-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-card/90 backdrop-blur-md shadow-sm border-border hover:bg-card/100 text-foreground"
            onClick={zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card/90 backdrop-blur-md shadow-sm border-border hover:bg-card/100 text-foreground"
            onClick={zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card/90 backdrop-blur-md shadow-sm border-border hover:bg-card/100 text-foreground"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {/* Toggle data panel button */}
          <Button
            variant={showDataPanel ? "default" : "outline"}
            size="icon"
            className={`${showDataPanel 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "bg-card/90 backdrop-blur-md shadow-sm border-border hover:bg-card/100 text-foreground"}`}
            onClick={toggleDataPanel}
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Data visualization panel with relationship metrics */}
      <AnimatePresence>
        {showDataPanel && dataPanelContent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-6 z-10 w-72 bg-card/95 backdrop-blur-md rounded-[12px] shadow-lg border border-border overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-primary">{dataPanelContent.title}</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-secondary hover:text-primary" onClick={() => setShowDataPanel(false)}>
                <span className="sr-only">关闭</span>
                <span aria-hidden="true">×</span>
              </Button>
            </div>
            
            <div className="p-4">
              {viewLevel === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-accent/50 p-3 rounded-[12px]">
                      <div className="text-xs text-secondary">联系人</div>
                      <div className="text-xl font-semibold text-primary">{dataPanelContent.data.totalContacts}</div>
                    </div>
                    <div className="bg-accent/50 p-3 rounded-[12px]">
                      <div className="text-xs text-secondary">互动总数</div>
                      <div className="text-xl font-semibold text-primary">{dataPanelContent.data.totalInteractions}</div>
                    </div>
                  </div>
                  
                  <div className="bg-accent/30 rounded-[12px] p-3">
                    <div className="text-xs text-secondary mb-1">人际平衡</div>
                    <div className="h-4 bg-accent/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-nodePositive" 
                        style={{ 
                          width: `${(dataPanelContent.data.positiveBalance / 
                            (dataPanelContent.data.positiveBalance + dataPanelContent.data.negativeBalance)) * 100}%`
                        }} 
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-secondary">
                      <span>正向: {dataPanelContent.data.positiveBalance}</span>
                      <span>负向: {dataPanelContent.data.negativeBalance}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {viewLevel === 'group' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-accent/50 p-3 rounded-[12px]">
                      <div className="text-xs text-secondary">成员数</div>
                      <div className="text-xl font-semibold text-primary">{dataPanelContent.data.memberCount}</div>
                    </div>
                    <div className="bg-accent/50 p-3 rounded-[12px]">
                      <div className="text-xs text-secondary">总互动</div>
                      <div className="text-xl font-semibold text-primary">{dataPanelContent.data.totalInteractions}</div>
                    </div>
                  </div>
                  
                  <div className="bg-accent/30 rounded-[12px] p-3">
                    <div className="text-xs text-secondary mb-1">互动频率</div>
                    <div className="text-lg font-semibold text-primary">
                      {dataPanelContent.data.averageInteractionFrequency.toFixed(1)} <span className="text-xs font-normal text-secondary">每人均值</span>
                    </div>
                  </div>
                  
                  <div className="bg-accent/30 rounded-[12px] p-3">
                    <div className="text-xs text-secondary mb-1">最后互动</div>
                    <div className="text-sm text-primary">
                      {dataPanelContent.data.lastInteraction ? new Date(dataPanelContent.data.lastInteraction).toLocaleDateString() : '无数据'}
                    </div>
                  </div>
                </div>
              )}
              
              {viewLevel === 'contact' && (
                <div className="space-y-6">
                  <div className="bg-accent/30 p-3 rounded-[12px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-secondary">类型</div>
                        <div className="font-medium text-primary">
                          {(() => {
                            switch(dataPanelContent.data.contact.type) {
                              case 'friend': return '朋友';
                              case 'family': return '家人';
                              case 'colleague': return '同事';
                              case 'acquaintance': return '熟人';
                              default: return dataPanelContent.data.contact.type;
                            }
                          })()}
                        </div>
                      </div>
                      
                      <Badge className={
                        dataPanelContent.data.contact.coins > 0 ? "bg-nodePositive/20 text-nodePositive border-nodePositive/30" :
                        dataPanelContent.data.contact.coins < 0 ? "bg-nodeNegative/20 text-nodeNegative border-nodeNegative/30" :
                        "bg-nodeNeutral/20 text-nodeNeutral border-nodeNeutral/30"
                      }>
                        {dataPanelContent.data.contact.coins > 0 ? '+' : ''}{dataPanelContent.data.contact.coins} 币
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-accent/50 p-3 rounded-[12px]">
                      <div className="text-xs text-secondary">连接数</div>
                      <div className="text-xl font-semibold text-primary">{dataPanelContent.data.connectionCount}</div>
                    </div>
                    <div className="bg-accent/50 p-3 rounded-[12px]">
                      <div className="text-xs text-secondary">互动总数</div>
                      <div className="text-xl font-semibold text-primary">{dataPanelContent.data.totalInteractions}</div>
                    </div>
                  </div>
                  
                  {dataPanelContent.data.contacts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-secondary">关联联系人</h4>
                      <div className="max-h-32 overflow-y-auto bg-accent/20 rounded-[12px] divide-y divide-border">
                        {dataPanelContent.data.contacts.map((contact: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 hover:bg-accent/30 text-sm">
                            <span className="text-primary">{contact.name}</span>
                            <Badge variant="secondary" className="text-xs bg-accent/50 text-secondary">
                              {contact.balance}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip overlay */}
      <AnimatePresence>
        {tooltipContent && (
          <motion.div 
            className="absolute z-20 pointer-events-none"
            style={{
              left: tooltipContent.x,
              top: tooltipContent.y
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {tooltipContent.content}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas element */}
      <canvas
        ref={canvasRef}
        className={`touch-none ${embedded ? 'h-[270px] w-full' : 'h-full w-full'}`}
      />
      
      {/* Context menu for interaction options - only shown when a node is selected */}
      <AnimatePresence>
        {selectedNode && !selectedNode.id.startsWith('group_') && selectedNode.id !== 'you' && (
          <motion.div 
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-card/90 backdrop-blur-md rounded-full shadow-lg p-1 flex space-x-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Button
              variant="ghost"
              size="sm" 
              className="flex items-center rounded-full px-3 text-secondary hover:text-primary"
              onClick={() => {
                onContactSelect(selectedNode);
                toast("Navigate to contact details", { icon: "👤" });
              }}
            >
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              <span className="text-sm">查看详情</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm" 
              className="flex items-center rounded-full px-3 text-secondary hover:text-primary"
              onClick={() => {
                toast("Added interaction with contact", { icon: "✏️" });
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="text-sm">添加互动</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkGraph;
