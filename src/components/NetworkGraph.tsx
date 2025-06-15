import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
  embedded?: boolean;
}

const NetworkGraph = ({ onBack, onContactSelect, embedded = false }: NetworkGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const [nodes] = useState<NetworkNode[]>([
    { id: 'you', name: 'You', x: 400, y: 300, radius: 22, color: '#3B82F6', coins: 0, type: 'self' },
    { id: 'sarah', name: 'Sarah Chen', x: 300, y: 200, radius: 18, color: '#10B981', coins: 250, type: 'friend' },
    { id: 'mike', name: 'Mike Johnson', x: 500, y: 180, radius: 16, color: '#6366F1', coins: -80, type: 'colleague' },
    { id: 'liu', name: 'Liu Wei', x: 250, y: 350, radius: 20, color: '#8B5CF6', coins: 150, type: 'friend' },
    { id: 'anna', name: 'Anna Smith', x: 550, y: 320, radius: 14, color: '#EC4899', coins: 45, type: 'acquaintance' },
    { id: 'david', name: 'David Kim', x: 350, y: 400, radius: 17, color: '#14B8A6', coins: -25, type: 'family' },
    { id: 'emma', name: 'Emma Wilson', x: 480, y: 250, radius: 15, color: '#F59E0B', coins: 90, type: 'colleague' }
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

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const visibleNodes = getVisibleNodes();
    const visibleConnections = getVisibleConnections();

    // Set canvas DPI for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (embedded) {
      canvas.width = rect.width * dpr;
      canvas.height = 300 * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    visibleConnections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        
        // Line style based on balance
        ctx.lineWidth = conn.strength * 3;
        ctx.strokeStyle = conn.balance === 'positive' ? 'rgba(16, 185, 129, 0.6)' : 
                         conn.balance === 'negative' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(156, 163, 175, 0.5)';
        ctx.stroke();
      }
    });

    // Draw nodes
    visibleNodes.forEach(node => {
      // Node shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      
      // Fill based on node type
      ctx.fillStyle = node.type === 'self' ? '#3B82F6' : 
                     (node.coins > 0 ? '#10B981' : 
                     (node.coins < 0 ? '#EF4444' : node.color));
      ctx.fill();

      // Border styles
      if (selectedNode?.id === node.id || focusedNode === node.id) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = selectedNode?.id === node.id ? '#3B82F6' : '#F59E0B';
        ctx.stroke();
      } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.stroke();
      }

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Name label
      ctx.font = embedded ? '11px system-ui' : '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#374151';
      ctx.fillText(node.name, node.x, node.y + node.radius + 15);

      // Coin balance for non-self nodes
      if (node.type !== 'self') {
        ctx.font = embedded ? '9px system-ui' : '10px system-ui';
        ctx.fillStyle = node.coins > 0 ? '#10B981' : '#EF4444';
        ctx.fillText(`${node.coins > 0 ? '+' : ''}${node.coins}`, node.x, node.y + node.radius + (embedded ? 28 : 30));
      }
    });
  };

  useEffect(() => {
    draw();
    
    // Handle window resize
    const handleResize = () => {
      draw();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes, connections, selectedNode, focusedNode, embedded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      const clickedNode = nodes.find(node => {
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        return distance <= node.radius;
      });

      if (clickedNode) {
        if (clickedNode.type === 'self') {
          // Reset focus when clicking on self
          setFocusedNode(null);
        } else {
          // Focus on clicked node or select for contact view
          if (focusedNode === clickedNode.id) {
            // If already focused, open contact profile
            setSelectedNode(clickedNode);
            onContactSelect(clickedNode);
          } else {
            // Focus on this node
            setFocusedNode(clickedNode.id);
          }
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [nodes, focusedNode, onContactSelect]);

  const handleShare = () => {
    toast('Network graph copied to clipboard', {
      icon: '📊',
      duration: 3000
    });
  };

  const resetFocus = () => {
    setFocusedNode(null);
  };

  if (embedded) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-800">Social Network</h3>
          {focusedNode && (
            <Button variant="outline" size="sm" onClick={resetFocus} className="text-xs px-2 py-1 h-auto">
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full h-auto max-w-full cursor-pointer"
            style={{ maxHeight: '50vh' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {focusedNode ? 'Tap highlighted contact to view details' : 'Tap any contact to focus on their connections'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="p-1 mr-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-medium text-gray-800">Social Network</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleShare} className="text-sm">
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </div>

      {/* Graph Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5"
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-auto max-w-full border border-gray-100 rounded-lg cursor-pointer"
          style={{ maxHeight: '60vh' }}
        />
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5"
      >
        <h3 className="font-medium text-gray-800 mb-3 text-sm">Legend</h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Positive Balance</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Negative Balance</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-5 h-1 bg-green-500 mr-2"></div>
              <span>Strong Connection</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-1 bg-gray-400 mr-2"></div>
              <span>Weak Connection</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex justify-center space-x-3">
        <Button variant="outline" onClick={resetFocus} size="sm" className="text-sm">
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
        <Button variant="outline" size="sm" className="text-sm">
          <ZoomIn className="w-3.5 h-3.5 mr-1" />
          Zoom In
        </Button>
        <Button variant="outline" size="sm" className="text-sm">
          <ZoomOut className="w-3.5 h-3.5 mr-1" />
          Zoom Out
        </Button>
        <Button variant="outline" onClick={handleShare} size="sm" className="text-sm">
          <Download className="w-3.5 h-3.5 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default NetworkGraph;
