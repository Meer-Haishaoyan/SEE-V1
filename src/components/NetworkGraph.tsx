import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Download, ZoomIn, ZoomOut, RotateCcw, Search, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Contact } from '@/types';

interface NetworkNode extends Contact {
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface NetworkConnection {
  from: string;
  to: string;
  strength: number;
  balance: 'positive' | 'negative' | 'neutral';
}

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [centerOffset, setCenterOffset] = useState({x: 0, y: 0});
  const [showPulse, setShowPulse] = useState(true);
  const [levelOfDetail, setLevelOfDetail] = useState<'overview' | 'focused' | 'detailed'>('overview');

  // 更苹果化的配色方案
  const theme = {
    bgGradient: 'rgba(240, 245, 250, 0.8)',
    nodeSelf: '#0A84FF',
    nodePositive: '#30D158', 
    nodeNegative: '#FF453A',
    nodeNeutral: '#8E8E93', 
    linkPositive: 'rgba(48, 209, 88, 0.6)', 
    linkNegative: 'rgba(255, 69, 58, 0.5)', 
    linkNeutral: 'rgba(142, 142, 147, 0.4)',
    nodeSelectedBorder: '#007AFF',
    nodeHoverBorder: '#FF9F0A',
    textPrimary: '#1C1C1E',
    textSecondary: '#6E6E73'
  };

  // 更丰富的网络数据
  const [nodes] = useState<NetworkNode[]>([
    { id: 'you', name: '我', x: 400, y: 300, radius: 22, color: theme.nodeSelf, coins: 0, type: 'self' },
    { id: 'sarah', name: '莎拉', x: 300, y: 200, radius: 18, color: theme.nodePositive, coins: 250, type: 'friend' },
    { id: 'mike', name: '迈克', x: 500, y: 180, radius: 16, color: theme.nodeNegative, coins: -80, type: 'colleague' },
    { id: 'liu', name: '刘伟', x: 250, y: 350, radius: 20, color: theme.nodePositive, coins: 150, type: 'friend' },
    { id: 'anna', name: '安娜', x: 550, y: 320, radius: 14, color: '#C7C7CC', coins: 45, type: 'acquaintance' },
    { id: 'david', name: '大卫', x: 350, y: 400, radius: 17, color: '#64D2FF', coins: -25, type: 'family' },
    { id: 'emma', name: '艾玛', x: 480, y: 250, radius: 15, color: '#FF9F0A', coins: 90, type: 'colleague' }
  ]);

  const [connections] = useState<NetworkConnection[]>([
    { from: 'you', to: 'sarah', strength: 0.8, balance: 'positive' },
    { from: 'you', to: 'mike', strength: 0.6, balance: 'negative' },
    { from: 'you', to: 'liu', strength: 0.7, balance: 'positive' },
    { from: 'you', to: 'anna', strength: 0.4, balance: 'neutral' },
    { from: 'you', to: 'david', strength: 0.9, balance: 'neutral' },
    { from: 'you', to: 'emma', strength: 0.5, balance: 'positive' },
    { from: 'sarah', to: 'mike', strength: 0.3, balance: 'neutral' },
    { from: 'liu', to: 'david', strength: 0.6, balance: 'positive' }
  ]);

  const getVisibleConnections = () => {
    if (!focusedNode) return connections;
    return connections.filter(conn => 
      conn.from === focusedNode || conn.to === focusedNode
    );
  };

  const getVisibleNodes = () => {
    if (!focusedNode) return nodes;
    const visibleConnections = getVisibleConnections();
    const visibleNodeIds = new Set([focusedNode]);
    
    visibleConnections.forEach(conn => {
      visibleNodeIds.add(conn.from);
      visibleNodeIds.add(conn.to);
    });
    
    return nodes.filter(node => visibleNodeIds.has(node.id));
  };

  const findNodeAt = (x: number, y: number): NetworkNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    // 应用缩放和平移变换
    const adjustedX = (x - centerOffset.x) / zoomLevel;
    const adjustedY = (y - centerOffset.y) / zoomLevel;

    const visibleNodes = getVisibleNodes();
    
    // 检查是否有节点在点击位置
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

    // 应用缩放和平移变换
    const adjustedX = (x - centerOffset.x) / zoomLevel;
    const adjustedY = (y - centerOffset.y) / zoomLevel;
    
    const visibleConnections = getVisibleConnections();
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    // 检查是否有连线在点击位置附近
    for (const conn of visibleConnections) {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      
      if (!fromNode || !toNode) continue;
      
      // 计算点到线段的最短距离
      const lineLength = Math.sqrt(Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2));
      if (lineLength === 0) continue;
      
      const t = ((adjustedX - fromNode.x) * (toNode.x - fromNode.x) + (adjustedY - fromNode.y) * (toNode.y - fromNode.y)) / Math.pow(lineLength, 2);
      
      if (t < 0) {
        // 最近点是起点
        const distance = Math.sqrt(Math.pow(adjustedX - fromNode.x, 2) + Math.pow(adjustedY - fromNode.y, 2));
        if (distance < 10) {
          return { ...conn, fromNode, toNode };
        }
      } else if (t > 1) {
        // 最近点是终点
        const distance = Math.sqrt(Math.pow(adjustedX - toNode.x, 2) + Math.pow(adjustedY - toNode.y, 2));
        if (distance < 10) {
          return { ...conn, fromNode, toNode };
        }
      } else {
        // 最近点在线段上
        const projectionX = fromNode.x + t * (toNode.x - fromNode.x);
        const projectionY = fromNode.y + t * (toNode.y - fromNode.y);
        const distance = Math.sqrt(Math.pow(adjustedX - projectionX, 2) + Math.pow(adjustedY - projectionY, 2));
        
        // 检查距离是否小于阈值（考虑线条粗细）
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

    // 设置画布DPI以支持高清显示
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

    // 应用变换
    ctx.save();
    ctx.translate(centerOffset.x, centerOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // 绘制连接线
    visibleConnections.forEach(conn => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      
      if (fromNode && toNode) {
        // 主线条
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        
        // 根据关系平衡设置线条样式
        const isHovered = hoveredConnection && 
          (hoveredConnection.from === conn.from && hoveredConnection.to === conn.to);
        
        ctx.lineWidth = (isHovered ? conn.strength * 5 : conn.strength * 3);
        ctx.strokeStyle = conn.balance === 'positive' ? theme.linkPositive : 
                         conn.balance === 'negative' ? theme.linkNegative : theme.linkNeutral;
        
        // 添加模糊效果
        if (isHovered) {
          ctx.shadowColor = conn.balance === 'positive' ? 'rgba(48, 209, 88, 0.7)' : 
                           conn.balance === 'negative' ? 'rgba(255, 69, 58, 0.7)' : 'rgba(142, 142, 147, 0.5)';
          ctx.shadowBlur = 8;
        }
        
        ctx.stroke();
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // 绘制连线上的方向箭头（在线条中点）
        if (levelOfDetail !== 'overview') {
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          
          ctx.save();
          ctx.translate(midX, midY);
          ctx.rotate(angle);
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-8, -4);
          ctx.lineTo(-8, 4);
          ctx.closePath();
          
          ctx.fillStyle = conn.balance === 'positive' ? theme.linkPositive : 
                         conn.balance === 'negative' ? theme.linkNegative : theme.linkNeutral;
          ctx.fill();
          
          ctx.restore();
        }
        
        // 在详细视图中显示交互强度
        if (levelOfDetail === 'detailed' || isHovered) {
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          
          // 绘制一个小圆形背景
          ctx.beginPath();
          ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          
          // 绘制交互强度文本
          ctx.font = '9px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = theme.textPrimary;
          ctx.fillText(`${Math.round(conn.strength * 100)}%`, midX, midY);
        }
      }
    });

    // 绘制节点和标签
    visibleNodes.forEach(node => {
      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;
      const isFocused = focusedNode === node.id;
      
      // 绘制脉冲动画 (仅对焦点节点或悬停节点)
      if ((isFocused || isHovered) && showPulse) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 1.8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(10, 132, 255, 0.1)';
        ctx.fill();
      }

      // 节点阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;

      // 节点圆形
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * (isHovered ? 1.05 : 1), 0, 2 * Math.PI);
      
      // 根据节点类型设置填充色
      ctx.fillStyle = node.type === 'self' ? theme.nodeSelf : 
                     (node.coins > 0 ? theme.nodePositive : 
                     (node.coins < 0 ? theme.nodeNegative : node.color));
      
      // 添加有光泽的渐变填充
      const gradient = ctx.createRadialGradient(
        node.x, node.y - node.radius * 0.3, 0,
        node.x, node.y, node.radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      
      ctx.fillStyle = ctx.fillStyle;
      ctx.fill();
      
      // 在顶部添加一个高光效果
      ctx.beginPath();
      ctx.arc(node.x, node.y - node.radius * 0.3, node.radius * 0.6, 0, Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
      
      // 边框样式
      ctx.lineWidth = isSelected || isFocused || isHovered ? 3 : 1;
      ctx.strokeStyle = isSelected ? theme.nodeSelectedBorder : 
                       isFocused ? '#FF9F0A' :
                       isHovered ? 'rgba(255, 159, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)';
      ctx.stroke();
      
      // 重置阴影
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 名称标签
      const fontSize = embedded ? (isHovered ? 12 : 11) : (isHovered ? 13 : 12);
      ctx.font = `${fontSize}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.textPrimary;
      
      // 在悬停时添加文本背景
      if (isHovered && !embedded) {
        const textWidth = ctx.measureText(node.name).width;
        const labelY = node.y + node.radius + 15;
        
        ctx.beginPath();
        ctx.roundRect(node.x - textWidth/2 - 4, labelY - fontSize, textWidth + 8, fontSize + 6, 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
      }
      
      ctx.fillStyle = isHovered ? '#000000' : theme.textPrimary;
      ctx.fillText(node.name, node.x, node.y + node.radius + 15);

      // 为非自身节点显示代币余额
      if (node.type !== 'self') {
        const coinsFontSize = embedded ? 9 : 10;
        ctx.font = `${coinsFontSize}px system-ui`;
        ctx.fillStyle = node.coins > 0 ? theme.nodePositive : theme.nodeNegative;
        ctx.fillText(`${node.coins > 0 ? '+' : ''}${node.coins}`, node.x, node.y + node.radius + (embedded ? 28 : 30));
      }
    });

    // 恢复画布状态
    ctx.restore();
  };

  useEffect(() => {
    draw();
    
    // 处理窗口大小变化
    const handleResize = () => {
      draw();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes, connections, selectedNode, hoveredNode, focusedNode, embedded, zoomLevel, centerOffset, levelOfDetail, hoveredConnection]);

  // 脉冲动画
  useEffect(() => {
    const timer = setInterval(() => {
      setShowPulse(prev => !prev);
    }, 1500);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 首先检查是否悬停在节点上
      const node = findNodeAt(x, y);
      setHoveredNode(node);
      
      // 如果没有悬停在节点上，检查是否悬停在连接线上
      if (!node) {
        const connection = findConnectionAt(x, y);
        setHoveredConnection(connection);
        
        // 如果悬停在连接上且有关系选择回调，通知父组件
        if (connection && onRelationSelect) {
          onRelationSelect(connection);
        }
      } else {
        // 清除连接悬停
        setHoveredConnection(null);
      }
      
      // 更新光标样式
      if (canvas) {
        canvas.style.cursor = node ? 'pointer' : (hoveredConnection ? 'pointer' : 'default');
      }
    };
    
    const handleMouseOut = () => {
      setHoveredNode(null);
      setHoveredConnection(null);
    };
    
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const clickedNode = findNodeAt(x, y);
      
      if (clickedNode) {
        if (clickedNode.type === 'self') {
          // 点击自身节点时重置焦点
          setFocusedNode(null);
          setLevelOfDetail('overview');
        } else if (focusedNode === clickedNode.id) {
          // 如果已经聚焦，则打开联系人资料
          setSelectedNode(clickedNode);
          onContactSelect(clickedNode);
        } else {
          // 聚焦到所点击的节点
          setFocusedNode(clickedNode.id);
          setLevelOfDetail('focused');
        }
      } else {
        // 检查是否点击了连接线
        const clickedConnection = findConnectionAt(x, y);
        
        if (clickedConnection && onRelationSelect) {
          // 如果点击了连接线，触发关系选择事件
          onRelationSelect(clickedConnection);
          setLevelOfDetail('detailed');
        } else if (!embedded) {
          // 如果点击了空白区域，重置焦点（仅在非嵌入式模式下）
          setFocusedNode(null);
          setLevelOfDetail('overview');
        }
      }
    };
    
    // 添加鼠标拖动支持
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // 仅左键
        setDragStart({x: e.clientX, y: e.clientY});
      }
    };
    
    const handleMouseUp = () => {
      setDragStart(null);
    };
    
    const handleMouseDrag = (e: MouseEvent) => {
      if (dragStart) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        setCenterOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        setDragStart({x: e.clientX, y: e.clientY});
      }
    };
    
    // 添加鼠标滚轮缩放支持
    const handleWheel = (e: WheelEvent) => {
      if (!embedded) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = Math.max(0.5, Math.min(2, zoomLevel + delta));
        setZoomLevel(newZoom);
      }
    };

    // 注册事件监听器
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseDrag);
    canvas.addEventListener('wheel', handleWheel);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseOut);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseDrag);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [nodes, connections, selectedNode, hoveredNode, hoveredConnection, focusedNode, zoomLevel, dragStart, centerOffset, embedded]);

  const handleShare = () => {
    toast.success('已复制分享链接到剪贴板', {
      duration: 3000
    });
  };

  // 重置视图函数
  const resetView = () => {
    setFocusedNode(null);
    setLevelOfDetail('overview');
    setZoomLevel(1);
    setCenterOffset({x: 0, y: 0});
  };

  // 增加/减少缩放级别
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  // 切换详细级别
  const toggleDetailLevel = () => {
    setLevelOfDetail(prev => 
      prev === 'overview' ? 'focused' : 
      prev === 'focused' ? 'detailed' : 'overview'
    );
  };

  return (
    <div className="w-full" ref={containerRef}>
      {!embedded && (
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="p-1">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleShare}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Share2 className="w-4 h-4 mr-1" />
              分享
            </Button>
            
            <Button
              onClick={() => {
                // 导出功能
                const canvas = canvasRef.current;
                if (canvas) {
                  const dataURL = canvas.toDataURL('image/png');
                  const link = document.createElement('a');
                  link.href = dataURL;
                  link.download = '社交网络图.png';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  toast.success('已导出为图片');
                }
              }}
              variant="outline" 
              className="text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              导出
            </Button>
          </div>
        </div>
      )}
      
      {/* 网络图canvas */}
      <div className={`relative ${embedded ? 'h-[300px]' : 'h-[500px]'} w-full rounded-lg overflow-hidden`}>
        <canvas 
          ref={canvasRef}
          className={`w-full h-full ${embedded ? '' : 'bg-gradient-to-br from-blue-50/80 to-white/90'} border border-gray-100 rounded-lg backdrop-blur-sm`}
        />
        
        {/* 控制按钮 */}
        {!embedded && (
          <div className="absolute bottom-4 right-4 flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Button 
              onClick={zoomIn} 
              variant="ghost" 
              size="sm"
              className="w-10 h-10 rounded-none border-0 border-b border-gray-200"
            >
              <Plus className="w-5 h-5 text-gray-700" />
            </Button>
            
            <Button 
              onClick={zoomOut} 
              variant="ghost" 
              size="sm"
              className="w-10 h-10 rounded-none border-0 border-b border-gray-200"
            >
              <Minus className="w-5 h-5 text-gray-700" />
            </Button>
            
            <Button 
              onClick={resetView} 
              variant="ghost" 
              size="sm"
              className="w-10 h-10 rounded-none border-0 border-b border-gray-200"
            >
              <RotateCcw className="w-4 h-4 text-gray-700" />
            </Button>
            
            <Button 
              onClick={toggleDetailLevel} 
              variant="ghost" 
              size="sm"
              className="w-10 h-10 rounded-none"
            >
              <Search className="w-4 h-4 text-gray-700" />
            </Button>
          </div>
        )}
        
        {/* 网络详情指标 */}
        {!embedded && levelOfDetail !== 'overview' && (
          <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-lg rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-1">网络统计</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>关系总数:</div>
              <div className="font-medium">{connections.length}</div>
              
              <div>联系人数量:</div>
              <div className="font-medium">{nodes.length - 1}</div>
              
              <div>正向关系:</div>
              <div className="font-medium text-green-600">
                {connections.filter(c => c.balance === 'positive').length}
              </div>
              
              <div>负向关系:</div>
              <div className="font-medium text-red-600">
                {connections.filter(c => c.balance === 'negative').length}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 交互提示 */}
      {embedded && (
        <div className="mt-2 text-center">
          <p className="text-xs text-blue-600">点击节点查看详情或点击连线查看关系</p>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
