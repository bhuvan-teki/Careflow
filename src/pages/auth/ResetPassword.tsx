import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { ArrowLeft } from "lucide-react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/Toast";

export function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Password reset successfully. You can now log in.",
          type: "success"
        });
        navigate('/clinic/login'); // Defaulting redirect, can be adjusted based on role
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Invalid or expired token",
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
          Create New Password
        </h2>
        <p className="text-text-secondary">
          Enter your new password below.
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="New Password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required 
            />
            <Input 
              label="Confirm Password" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required 
            />
            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
