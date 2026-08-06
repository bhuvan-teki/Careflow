import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export function ClinicLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/clinic/login', formData);
      if (res.data.success) {
        login(res.data.user, res.data.token);
        toast({
          title: "Success",
          description: "Successfully logged in to Clinic Portal",
          type: "success"
        });
        navigate('/clinic/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
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
          Clinic Login
        </h2>
        <p className="text-text-secondary">
          Welcome back to your practice dashboard
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Work Email" 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@clinic.com"
              required 
            />
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text-primary">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-medium text-text-secondary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-sm"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                name="password"
                type="password" 
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required 
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-text-secondary">
        Don't have an account?{" "}
        <Link to="/clinic/register" className="font-medium text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-sm">
          Register Clinic
        </Link>
      </p>
    </div>
  );
}
