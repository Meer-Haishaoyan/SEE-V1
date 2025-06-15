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
    { id: 'you', name: 'You', x: 400, y: 300, radius: 25, color: '#3B82F6', coins: 0, type: 'self' },
    { id: 'sarah', name: 'Sarah Chen', x: 300, y: 200, radius: 20, color: '#10B981', coins: 250, type: 'friend' },
    { id: 'mike', name: 'Mike Johnson', x: 500, y: 180, radius: 18, color: '#F59E0B', coins: -80, type: 'colleague' },
    { id: 'liu', name: 'Liu Wei', x: 250, y: 350, radius: 22, color: '#EF4444', coins: 150, type: 'friend' },
    { id: 'anna', name: 'Anna Smith', x: 550, y: 320, radius: 16, color: '#8B5CF6', coins: 45, type: 'acquaintance' },
    { id: 'david', name: 'David Kim', x: 350, y: 400, radius: 19, color: '#06B6D4', coins: -25, type: 'family' },
    { id: 'emma', name: 'Emma Wilson', x: 480, y: 250, radius: 15, color: '#F97316', coins: 90, type: 'colleague' }
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
        ctx.lineWidth = conn.strength * 4;
        ctx.strokeStyle = conn.balance === 'positive' ? '#10B981' : 
                         conn.balance === 'negative' ? '#EF4444' : '#6B7280';
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw nodes
    visibleNodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      
      // Node color based on coin balance
      ctx.fillStyle = node.coins > 0 ? '#10B981' : 
                     node.coins < 0 ? '#EF4444' : node.color;
      ctx.fill();
      
      // Border
      ctx.strokeStyle = selectedNode?.id === node.id ? '#3B82F6' : 
                       focusedNode === node.id ? '#F59E0B' : '#FFFFFF';
      ctx.lineWidth = (selectedNode?.id === node.id || focusedNode === node.id) ? 3 : 2;
      ctx.stroke();

      // Name label
      ctx.fillStyle = '#374151';
      ctx.font = embedded ? '10px system-ui' : '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y + node.radius + 15);

      // Coin balance
      if (node.type !== 'self') {
        ctx.fillStyle = node.coins > 0 ? '#10B981' : '#EF4444';
        ctx.font = embedded ? '8px system-ui' : '10px system-ui';
        ctx.fillText(`${node.coins > 0 ? '+' : ''}${node.coins}`, node.x, node.y + node.radius + (embedded ? 25 : 28));
      }
    });
  };

  useEffect(() => {
    draw();
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

      console.log('Canvas clicked at:', x, y);

      const clickedNode = nodes.find(node => {
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        console.log(`Distance to ${node.name}:`, distance, 'Radius:', node.radius);
        return distance <= node.radius;
      });

      if (clickedNode) {
        console.log('Clicked node:', clickedNode.name);
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
    toast('Network graph exported and ready to share!', {
      icon: '📊'
    });
  };

  const resetFocus = () => {
    setFocusedNode(null);
  };

  if (embedded) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Social Entropy Graph</h3>
          {focusedNode && (
            <Button variant="outline" size="sm" onClick={resetFocus}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto max-w-full border rounded-lg cursor-pointer"
          style={{ maxHeight: '50vh' }}
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          {focusedNode ? 'Click on the focused node again to view details, or click "You" to reset' : 'Click on any node to focus on its connections'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">Social Entropy Graph</h1>
        <Button variant="ghost" onClick={handleShare} className="p-2">
          <Share2 className="w-6 h-6" />
        </Button>
      </div>

      {/* Graph Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-4 mb-4"
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto max-w-full border rounded-lg cursor-pointer"
          style={{ maxHeight: '70vh' }}
        />
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-4 mb-4"
      >
        <h3 className="font-semibold text-gray-800 mb-3">Legend</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Positive Balance</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span>Negative Balance</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-1 bg-green-500 mr-2"></div>
              <span>Strong Connection</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-1 bg-gray-400 mr-2"></div>
              <span>Weak Connection</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={resetFocus} className="flex items-center">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Focus
        </Button>
        <Button variant="outline" className="flex items-center">
          <ZoomIn className="w-4 h-4 mr-2" />
          Zoom In
        </Button>
        <Button variant="outline" className="flex items-center">
          <ZoomOut className="w-4 h-4 mr-2" />
          Zoom Out
        </Button>
        <Button variant="outline" onClick={handleShare} className="flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default NetworkGraph;
