import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-accent/50 rounded-full flex items-center justify-center">
            <span className="text-4xl text-primary">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-primary mb-2">页面未找到</h1>
        <p className="text-secondary mb-6">
          抱歉，您请求的页面不存在或已被移除。请检查URL或返回首页。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-border bg-accent/30 text-primary"
          >
            <Link to="javascript:history.back()">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Link>
          </Button>
          <Button 
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
