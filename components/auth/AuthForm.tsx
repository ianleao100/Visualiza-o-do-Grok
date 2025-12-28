import React, { useState } from 'react';
import { Button } from '../Button';
import { UserRole } from '../../types';

interface AuthFormProps {
  title: string;
  role: UserRole; // Using UserRole instead of union string
  onCancel: () => void;
  onLogin: (role: UserRole) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ title, role, onCancel, onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validate here. For demo, we just accept anything.
    onLogin(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username / Email</label>
            <input type="text" required value={user} onChange={e => setUser(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" required value={pass} onChange={e => setPass(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500" />
          </div>
          <Button type="submit" className="w-full">{role === UserRole.CLIENT ? 'Sign In / Sign Up' : 'Login'}</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>Cancel</Button>
        </form>
      </div>
    </div>
  );
};