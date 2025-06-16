import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // 识别设备类型
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检查设备类型
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice || window.innerWidth < 768);
    };

    // 初始检查
    checkMobile();

    // 窗口大小改变时重新检查
    window.addEventListener('resize', checkMobile);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 检测安全区域，适配iPhone刘海屏等
  useEffect(() => {
    function setSafeAreaVariables() {
      // 获取安全区域
      const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0');
      const safeAreaRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0');
      const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
      const safeAreaLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0');

      // 设置安全区域变量
      document.documentElement.style.setProperty('--safe-area-top', `${safeAreaTop}px`);
      document.documentElement.style.setProperty('--safe-area-right', `${safeAreaRight}px`);
      document.documentElement.style.setProperty('--safe-area-bottom', `${safeAreaBottom}px`);
      document.documentElement.style.setProperty('--safe-area-left', `${safeAreaLeft}px`);
    }

    setSafeAreaVariables();
    window.addEventListener('resize', setSafeAreaVariables);

    return () => {
      window.removeEventListener('resize', setSafeAreaVariables);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className={isMobile ? 'mobile-device' : ''}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index isMobile={isMobile} />} />
              <Route path="/insights" element={<Insights isMobile={isMobile} />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
