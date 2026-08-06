import { Logo } from "../ui/Logo";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  "Smart Care Coordination",
  "Connected Clinic Workflow",
  "Intelligent Patient Management",
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 lg:p-16 xl:p-24 border-r border-border">
        <div className="space-y-12">
          <Logo />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-md"
          >
            <h1 className="text-4xl font-semibold tracking-tight text-white leading-tight">
              AI-powered <br /> Healthcare Coordination
            </h1>
            <p className="text-lg text-text-secondary">
              Streamlining the future of medical practice with intelligent workflows and seamless patient experiences.
            </p>
          </motion.div>
          
          <div className="space-y-4 pt-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                className="flex items-center gap-4 text-text-secondary"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface border border-border">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-text-secondary">
          © {new Date().getFullYear()} CareFlow Technologies, Inc.
        </div>
      </div>

      {/* Right Panel - Authentication Forms */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md lg:max-w-lg space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Logo />
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
