import React, { useState } from 'react';
import { Product } from '../types';
import { INITIAL_PRODUCTS, CATEGORIES } from '../constants';
import { Button } from './Button';
import { generateDishDescription, generateDishImage, analyzeOrderTrends } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Menu, Settings, LogOut, Plus, Edit2, Wand2, ImagePlus, Save } from 'lucide-react';

interface AdminViewProps {
  onLogout: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'MENU'>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  // AI States
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Mock Sales Data
  const data = [
    { name: 'Mon', sales: 400 },
    { name: 'Tue', sales: 300 },
    { name: 'Wed', sales: 600 },
    { name: 'Thu', sales: 500 },
    { name: 'Fri', sales: 900 },
    { name: 'Sat', sales: 1200 },
    { name: 'Sun', sales: 800 },
  ];

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleAddNew = () => {
    setEditingProduct({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      price: 0,
      category: 'Burgers',
      imageUrl: 'https://picsum.photos/400/300'
    });
  };

  const handleSaveProduct = () => {
    if (!editingProduct || !editingProduct.name) return;
    
    setProducts(prev => {
      const exists = prev.find(p => p.id === editingProduct.id);
      if (exists) {
        return prev.map(p => p.id === editingProduct.id ? editingProduct as Product : p);
      }
      return [...prev, editingProduct as Product];
    });
    setEditingProduct(null);
  };

  const generateAIContent = async () => {
    if (!editingProduct?.name) return;
    setIsGeneratingDesc(true);
    const desc = await generateDishDescription(editingProduct.name, "secret ingredients");
    setEditingProduct(prev => ({ ...prev, description: desc }));
    setIsGeneratingDesc(false);
  };

  const generateAIImage = async () => {
    if (!editingProduct?.name) return;
    setIsGeneratingImg(true);
    const imgData = await generateDishImage(editingProduct.name);
    if (imgData) {
      setEditingProduct(prev => ({ ...prev, imageUrl: imgData }));
    } else {
        alert("Failed to generate image. Try again.");
    }
    setIsGeneratingImg(false);
  };

  const runAnalysis = async () => {
      setAiAnalysis("Thinking...");
      const result = await analyzeOrderTrends("Sales peaked on Saturday (1200) but dipped on Tuesday (300). Burgers are top sellers.");
      setAiAnalysis(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveView('DASHBOARD')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeView === 'DASHBOARD' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView('MENU')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeView === 'MENU' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Menu className="w-5 h-5 mr-3" />
            Menu Management
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button variant="secondary" onClick={onLogout} className="w-full justify-start">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeView === 'DASHBOARD' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium">Total Revenue</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">$12,450</p>
                <span className="text-green-500 text-sm">+12% from last week</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium">Total Orders</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">1,240</p>
                <span className="text-green-500 text-sm">+5% from last week</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium">Avg. Order Value</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">$24.50</p>
                <span className="text-slate-400 text-sm">Stable</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Sales</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

             {/* AI Insights Section */}
             <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <Wand2 className="w-6 h-6 text-yellow-400" />
                     <h3 className="text-lg font-bold">Gemini Business Intelligence</h3>
                  </div>
                  <Button size="sm" onClick={runAnalysis} className="bg-indigo-600 hover:bg-indigo-700">Run Analysis</Button>
                </div>
                <p className="text-indigo-200">
                    {aiAnalysis || "Click 'Run Analysis' to let Gemini Pro analyze your sales patterns and suggest improvements using its reasoning capabilities."}
                </p>
             </div>
          </div>
        )}

        {activeView === 'MENU' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Menu Management</h2>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Button>
            </div>

            {editingProduct ? (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-2xl">
                 <h3 className="text-lg font-bold mb-4">{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                     <input 
                        type="text" 
                        value={editingProduct.name} 
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500"
                      />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                     <select 
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full border rounded-lg p-2"
                     >
                       {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                     <input 
                        type="number" 
                        value={editingProduct.price} 
                        onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                        className="w-full border rounded-lg p-2"
                      />
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <button onClick={generateAIContent} disabled={isGeneratingDesc || !editingProduct.name} className="text-xs text-orange-600 flex items-center hover:underline">
                          <Wand2 className="w-3 h-3 mr-1" />
                          {isGeneratingDesc ? 'Generating...' : 'Auto-Generate with AI'}
                        </button>
                     </div>
                     <textarea 
                        value={editingProduct.description} 
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full border rounded-lg p-2 h-24"
                      />
                   </div>

                   <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Image URL</label>
                        <button onClick={generateAIImage} disabled={isGeneratingImg || !editingProduct.name} className="text-xs text-indigo-600 flex items-center hover:underline">
                          <ImagePlus className="w-3 h-3 mr-1" />
                          {isGeneratingImg ? 'Creating Image...' : 'Generate Image with AI'}
                        </button>
                     </div>
                     <input 
                        type="text" 
                        value={editingProduct.imageUrl} 
                        onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                        className="w-full border rounded-lg p-2 mb-2"
                      />
                      {editingProduct.imageUrl && (
                        <img src={editingProduct.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                      )}
                   </div>
                 </div>

                 <div className="flex gap-4 mt-6">
                   <Button onClick={handleSaveProduct} className="flex-1">
                     <Save className="w-4 h-4 mr-2" />
                     Save Product
                   </Button>
                   <Button variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">
                     Cancel
                   </Button>
                 </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-medium text-slate-500">Image</th>
                      <th className="p-4 font-medium text-slate-500">Name</th>
                      <th className="p-4 font-medium text-slate-500">Category</th>
                      <th className="p-4 font-medium text-slate-500">Price</th>
                      <th className="p-4 font-medium text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover" />
                        </td>
                        <td className="p-4 font-medium text-slate-900">{p.name}</td>
                        <td className="p-4 text-slate-500">{p.category}</td>
                        <td className="p-4 text-slate-900">${p.price.toFixed(2)}</td>
                        <td className="p-4">
                          <button onClick={() => handleEdit(p)} className="text-slate-400 hover:text-orange-600">
                            <Edit2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};