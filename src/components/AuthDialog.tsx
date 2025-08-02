'use client';

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { getTranslation } from '../lib/il8n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

export default function AuthDialog({ open, onOpenChange, mode, onModeChange }: AuthDialogProps) {
  const { state, login, register } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const t = (key: keyof typeof import('../lib/il8n').translations.tr) =>
    getTranslation(key, state.language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        // Validation for registration
        const newErrors = [];
        if (!formData.name.trim()) newErrors.push('Name is required');
        if (!formData.email.trim()) newErrors.push('Email is required');
        if (formData.password.length < 6) newErrors.push('Password must be at least 6 characters');
        if (formData.password !== formData.confirmPassword) newErrors.push('Passwords do not match');

        if (newErrors.length > 0) {
          setErrors(newErrors);
          setIsLoading(false);
          return;
        }

        const success = await register(formData.email, formData.name, formData.password);
        if (success) {
          onOpenChange(false);
          setFormData({ email: '', name: '', password: '', confirmPassword: '' });
        } else {
          setErrors(['Registration failed. Please try again.']);
        }
      } else {
        // Login
        if (!formData.email.trim() || !formData.password.trim()) {
          setErrors(['Email and password are required']);
          setIsLoading(false);
          return;
        }

        const success = await login(formData.email, formData.password);
        if (success) {
          onOpenChange(false);
          setFormData({ email: '', name: '', password: '', confirmPassword: '' });
        } else {
          setErrors(['Invalid email or password']);
        }
      }
    } catch (error) {
      setErrors(['An error occurred. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]); // Clear errors when user starts typing
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === 'login' ? t('login') : t('register')}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'login'
              ? 'Enter your credentials to access your account'
              : 'Create a new account to start playing'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter your password"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {errors.length > 0 && (
            <Alert className="bg-red-900 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (mode === 'login' ? t('login') : t('register'))}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              className="text-yellow-400 hover:text-yellow-300"
            >
              {mode === 'login'
                ? `Don't have an account? ${t('register')}`
                : `Already have an account? ${t('login')}`
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
