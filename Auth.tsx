import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Lock, Mail, Layout } from 'lucide-react';

export default function Auth() {
const [loading, setLoading] = useState(false);
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLogin, setIsLogin] = useState(true);
const [message, setMessage] = useState('');

const handleAuth = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setMessage('');

};

return (
<div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
<div className="sm:mx-auto sm:w-full sm:max-w-md">
<div className="flex justify-center">
<div className="bg-indigo-600 p-3 rounded-xl">
<Layout className="w-8 h-8 text-white" />
</div>
</div>
<h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
Makigami AI Generator
</h2>
<p className="mt-2 text-center text-sm text-slate-600">
{isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
</p>
</div>

);
}
