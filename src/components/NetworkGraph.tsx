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

  // Apple-style color scheme
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

  // Rich network data
  const [nodes] = useState<NetworkNode[]>([
    { id: 'you', name: 'You', x: 400, y: 300, radius: 22, color: theme.nodeSelf, coins: 0, type: 'self' },
    { id: 'sarah', name: 'Sarah', x: 300, y: 200, radius: 18, color: theme.nodePositive, coins: 250, type: 'friend' },
    { id: 'mike', name: 'Mike', x: 500, y: 180, radius: 16, color: theme.nodeNegative, coins: -80, type: 'colleague' },
    { id: 'liu', name: 'Liu Wei', x: 250, y: 350, radius: 20, color: theme.nodePositive, coins: 150, type: 'friend' },
    { id: 'anna', name: 'Anna', x: 550, y: 320, radius: 14, color: '#C7C7CC', coins: 45, type: 'acquaintance' },
    { id: 'david', name: 'David', x: 350, y: 400, radius: 17, color: '#64D2FF', coins: -25, type: 'family' },
    { id: 'emma', name: 'Emma', x: 480, y: 250, radius: 15, color: '#FF9F0A', coins: 90, type: 'colleague' }
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

    // Draw connections
    visibleConnections.forEach(conn => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      
      if (fromNode && toNode) {
        // Main line
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        
        // Set line style based on relationship balance
        const isHovered = hoveredConnection && 
          (hoveredConnection.from === conn.from && hoveredConnection.to === conn.to);
        
        ctx.lineWidth = (isHovered ? conn.strength * 5 : conn.strength * 3);
        ctx.strokeStyle = conn.balance === 'positive' ? theme.linkPositive : 
                         conn.balance === 'negative' ? theme.linkNegative : theme.linkNeutral;
        
        // Add blur effect
        if (isHovered) {
          ctx.shadowColor = conn.balance === 'positive' ? 'rgba(48, 209, 88, 0.7)' : 
                           conn.balance === 'negative' ? 'rgba(255, 69, 58, 0.7)' : 'rgba(142, 142, 147, 0.5)';
          ctx.shadowBlur = 8;
        }
        
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Draw direction arrow (at line midpoint)
        if (levelOfDetail !== 'overview') {
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          
          ctx.save();
          ctx.translate(midX, midY);
          ctx.rotate(angle);
          
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-6, -3);
          ctx.lineTo(-5, 0);
          ctx.lineTo(-6, 3);
          ctx.closePath();
          
          const arrowColor = conn.balance === 'positive' ? theme.nodePositive : 
                            conn.balance === 'negative' ? theme.nodeNegative : theme.nodeNeutral;
          ctx.fillStyle = arrowColor;
          ctx.fill();
          
          ctx.restore();
        }
      }
    });

    // Draw nodes
    visibleNodes.forEach(node => {
      // Draw selection/hover indicators
      if (selectedNode?.id === node.id || hoveredNode?.id === node.id) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = selectedNode?.id === node.id ? 'rgba(0, 122, 255, 0.1)' : 'rgba(255, 159, 10, 0.1)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = selectedNode?.id === node.id ? theme.nodeSelectedBorder : theme.nodeHoverBorder;
        ctx.stroke();
      }
      
      // Add pulse effect for main nodes
      if (showPulse && (node.id === 'you' || node.coins > 100)) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}22`;
        ctx.fill();
      }
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      
      // Draw inner highlight for dimension
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `${node.color}77`;
      ctx.fill();
      
      // Draw label for nodes based on detail level
      if (levelOfDetail !== 'overview' || node.id === 'you' || node.radius > 15 || hoveredNode?.id === node.id || selectedNode?.id === node.id) {
        const fontSize = Math.max(10, Math.min(14, node.radius * 0.7));
        ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        
        // Draw name
        ctx.fillText(node.name, node.x, node.y);
      }
    });
    
    // Restore context
    ctx.restore();
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
    setHoveredNode(node);
    
    // Check for connection hover if not hovering over a node
    if (!node) {
      const connection = findConnectionAt(x, y);
      setHoveredConnection(connection);
    } else {
      setHoveredConnection(null);
    }
    
    // Update cursor style
    if (node || hoveredConnection) {
      canvasRef.current!.style.cursor = 'pointer';
    } else {
      canvasRef.current!.style.cursor = dragStart ? 'grabbing' : 'grab';
    }
  };
  
  const handleMouseOut = () => {
    setHoveredNode(null);
    setHoveredConnection(null);
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
      if (node.id === selectedNode?.id) {
        setSelectedNode(null);
      } else {
        setSelectedNode(node);
        
        if (node.id !== 'you') {
          onContactSelect(node);
        }
      }
      
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

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {!embedded && (
        <div className="absolute top-6 left-6 z-10 flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 hover:bg-white"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 text-gray-700" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 hover:bg-white"
            onClick={() => {}}
          >
            <Download className="h-4 w-4 text-gray-700" />
          </Button>
        </div>
      )}

      {!embedded && (
        <div className="absolute bottom-6 right-6 z-10 flex flex-col space-y-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 hover:bg-white"
            onClick={zoomIn}
          >
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 hover:bg-white"
            onClick={zoomOut}
          >
            <ZoomOut className="h-4 w-4 text-gray-700" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 hover:bg-white"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4 text-gray-700" />
          </Button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`touch-none ${embedded ? 'h-[270px] w-full' : 'h-full w-full'}`}
      />
    </div>
  );
};

export default NetworkGraph;
