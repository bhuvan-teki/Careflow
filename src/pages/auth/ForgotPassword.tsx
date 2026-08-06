import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { useToast } from "../../components/ui/Toast";

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setIsSubmitted(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Could not process request",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to options
      </Link>

      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Reset Password
        </h2>
        <p className="text-text-secondary">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          {!isSubmitted ? (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              <Input 
                label="Email address" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required 
              />
              <div className="pt-2">
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-6 text-center space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-white">Check your email</h3>
                <p className="text-sm text-text-secondary">
                  We've sent a password reset link to your email address.
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
