'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    console.log('Registering with:', { name, email, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Luo uusi tunnus</h1>
          <p className="text-slate-500">Liity asiakasportaaliimme</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Nimi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="Sähköposti"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Salasana"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-2 rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Rekisteröidy
          </motion.button>
        </form>
        <div className="text-center mt-6">
          <p className="text-slate-500">
            Onko sinulla jo tunnus?{' '}
            <Link href="/customer/auth/login" className="text-purple-600 hover:underline">
              Kirjaudu sisään
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
