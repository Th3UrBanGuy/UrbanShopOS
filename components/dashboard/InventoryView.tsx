'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Search, MoreVertical, DollarSign, ShieldCheck, 
  ChevronLeft, Eye, EyeOff, Image as ImageIcon, Layers, Palette, Ruler, 
  Trash2, Save, Edit3, X, Zap, Copy, ArrowLeft
} from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import { cn } from '@/lib/utils';
import { useInventoryStore, InventoryProduct, ColorVariant } from '@/store/inventoryStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useToastStore } from '@/store/toastStore';

function MiniStat({ title, value, color }: { title: string, value: string, color?: string }) {
  return (
    <div className="flex flex-col">
       <span className={cn("text-[10px] font-black uppercase tracking-widest", color ? color : "text-[var(--text-muted)]")}>{value}</span>
       <span className="text-[8px] font-bold text-[var(--text-muted)] opacity-25 uppercase tracking-tighter">{title}</span>
    </div>
  );
}

export default function InventoryView() {
  const { products, updateStock, updateProduct, addProduct } = useInventoryStore();
  const { setActiveTab } = useDashboardStore();
  const settings = useSettingsStore();
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<InventoryProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.article.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedProduct) {
      setEditForm({ ...selectedProduct });
    } else {
      setEditForm(null);
      setIsEditing(false);
    }
  }, [selectedProduct]);

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isEditing && editForm) {
      setEditForm({ ...editForm, stock: val });
    } else if (selectedProduct) {
      updateStock(selectedProduct.id, val);
    }
  };

  const handleSave = () => {
    if (editForm) {
      updateProduct(editForm);
      setSelectedProduct(editForm);
      setIsEditing(false);
      useToastStore.getState().addToast('Product saved successfully', 'success');
    }
  };

  const handleAddNew = () => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const newProduct: InventoryProduct = {
      id: newId,
      article: `AR-${newId}-NEW`,
      name: 'New Resin Asset',
      price: 0,
      purchasePrice: 0,
      stock: 0,
      category: 'General',
      tag: 'NEW',
      rating: 0,
      tax: 15,
      sales7d: [0, 0, 0, 0, 0, 0, 0],
      showInEcom: false,
      variants: []
    };
    addProduct(newProduct);
    setSelectedProduct(newProduct);
    setIsEditing(true);
  };

  const addVariant = () => {
    if (!editForm) return;
    const newVariant: ColorVariant = {
      color: 'New Hue',
      sizes: [{ size: 'STD', stock: 0, priceAdjustment: 0 }],
      styles: []
    };
    setEditForm({
      ...editForm,
      variants: [...(editForm.variants || []), newVariant]
    });
  };

  const removeVariant = (index: number) => {
    if (!editForm) return;
    const newVariants = [...editForm.variants];
    newVariants.splice(index, 1);
    setEditForm({ ...editForm, variants: newVariants });
  };

  const updateVariant = (index: number, field: keyof ColorVariant, value: ColorVariant[keyof ColorVariant]) => {
    if (!editForm) return;
    const newVariants = [...editForm.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setEditForm({ ...editForm, variants: newVariants });
  };

  const addSize = (vIndex: number) => {
    if (!editForm) return;
    const newVariants = [...editForm.variants];
    newVariants[vIndex].sizes.push({ size: '', stock: 0, priceAdjustment: 0 });
    setEditForm({ ...editForm, variants: newVariants });
  };

  const bulkAddSizes = (vIndex: number, start: number, end: number) => {
    if (!editForm) return;
    const newVariants = [...editForm.variants];
    const existingSizes = new Set(newVariants[vIndex].sizes.map(s => s.size.trim()));
    
    for (let i = start; i <= end; i++) {
        const sizeStr = i.toString();
        if (!existingSizes.has(sizeStr)) {
            newVariants[vIndex].sizes.push({ size: sizeStr, stock: 0, priceAdjustment: 0 });
        }
    }
    
    // Remove the 'STD' size if it was the only one and empty
    if (newVariants[vIndex].sizes.length > 1) {
        newVariants[vIndex].sizes = newVariants[vIndex].sizes.filter(s => s.size !== 'STD' || s.stock > 0);
    }
    
    setEditForm({ ...editForm, variants: newVariants });
  };

  const handleClone = () => {
    if (!selectedProduct) return;
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const clonedProduct: InventoryProduct = {
      ...selectedProduct,
      id: newId,
      article: `${selectedProduct.article}-CLONE`,
      name: `${selectedProduct.name} (Copy)`
    };
    addProduct(clonedProduct);
    setSelectedProduct(clonedProduct);
    setIsEditing(true);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 overflow-hidden relative">
      
      {/* List Pane */}
      <div className={cn(
        "flex-col gap-4 transition-all duration-500 h-full overflow-hidden shrink-0",
        selectedProduct ? "hidden md:flex md:w-1/3 lg:w-1/4" : "flex w-full md:w-1/3 lg:w-1/4"
      )}>
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('Management')}
              className="w-10 h-10 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-all shadow-resin"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none mb-1 text-[var(--text-primary)]">Inventory</h2>
              <p className="text-[9px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-[0.2em]">Stock Control Room</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex flex-col items-end mr-3">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-0.5">Assets Value</span>
                <span className="text-xs font-black text-[var(--text-primary)]">{settings.formatPrice(products.reduce((acc, p) => acc + (p.purchasePrice || 0) * (p.stock || 0), 0))}</span>
             </div>
             <LiquidButton onClick={handleAddNew} variant="icon" className="w-10 h-10 p-0 flex items-center justify-center">
               <Plus size={18} />
             </LiquidButton>
          </div>
        </div>

        <motion.div 
          initial={false}
          className="relative shrink-0"
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Filter catalog..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:bg-[var(--card-bg)] focus:border-[var(--accent)]/30 transition-all shadow-resin"
          />
        </motion.div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-32 pr-1">
          <AnimatePresence>
            {filteredProducts.map((p, idx) => (
              <motion.div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                  selectedProduct?.id === p.id 
                    ? "bg-[var(--accent)]/15 border-[var(--accent)]/50 shadow-[0_0_30px_var(--accent-glow)]" 
                    : "bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--text-muted)] hover:bg-[var(--card-bg)] shadow-resin"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="min-w-0">
                    <h4 className={cn("text-sm font-bold transition-colors truncate", selectedProduct?.id === p.id ? "text-[var(--accent)] opacity-80" : "text-[var(--text-primary)] group-hover:text-[var(--text-primary)]")}>{p.name}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">{p.article}</p>
                      {!p.showInEcom && <EyeOff size={10} className="text-rose-500/50" />}
                    </div>
                  </div>
                  <span className="text-sm font-black shrink-0 ml-2 tracking-tighter text-[var(--text-primary)]">{settings.formatPrice(p.price)}</span>
                </div>
                
                <div className="relative h-1 w-full bg-[var(--background)]/20 rounded-full overflow-hidden z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((p.stock / 200) * 100, 100)}%` }}
                    className={cn("h-full rounded-full", p.stock < 15 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]")}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Details Pane */}
      <AnimatePresence mode="wait">
        {selectedProduct && editForm ? (
          <motion.div
            key={selectedProduct.id}
            initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "flex-1 flex flex-col gap-6 h-full",
              "fixed inset-0 z-50 p-4 bg-[var(--background)] md:bg-transparent md:relative md:p-0 md:z-auto"
            )}
          >
            {/* Header with Actions */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "var(--card-bg)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedProduct(null)}
                  className="w-9 h-9 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center transition-colors shadow-resin text-[var(--text-primary)]"
                >
                  <ChevronLeft size={18} />
                </motion.button>
                <div>
                  <h2 className="text-lg font-black tracking-tight uppercase leading-none text-[var(--text-primary)]">
                    {isEditing ? "Editing Product" : editForm.name}
                  </h2>
                  <p className="text-[8px] text-[var(--text-muted)] font-bold tracking-widest mt-1 uppercase">
                    {isEditing ? `Code: ${editForm.article}` : 'Product Details'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="h-10 px-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--card-bg)]/80 transition-colors text-[var(--text-muted)]"
                    >
                      Discard
                    </motion.button>
                    <LiquidButton
                      onClick={handleSave}
                      className="h-10 px-6"
                    >
                      <Save size={16} className="mr-2" /> Save Changes
                    </LiquidButton>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.button 
                      onClick={handleClone}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                      whileTap={{ scale: 0.95 }}
                      className="h-10 px-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-resin"
                    >
                       <Copy size={14} className="text-[var(--accent)]" /> Duplicate
                    </motion.button>
                    <LiquidButton
                      onClick={() => setIsEditing(true)}
                      className="h-10 px-6"
                    >
                      <Edit3 size={16} className="mr-2" /> Edit Product
                    </LiquidButton>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-resin"
                    >
                      <MoreVertical size={20} />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual Identity & Visibility */}
                <ResinCard className="p-6 md:p-8" glowingColor="rgba(99,102,241,0.12)">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Image Preview */}
                    <div className="w-full sm:w-40 aspect-square rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col items-center justify-center relative overflow-hidden group shrink-0">
                      <AnimatePresence mode="wait">
                        {editForm.image ? (
                          <motion.img 
                            key={editForm.image}
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={editForm.image} 
                            alt={editForm.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <motion.div 
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center"
                          >
                            <ImageIcon size={32} className="text-[var(--text-muted)] opacity-20 mb-2" />
                            <span className="text-[8px] font-black text-[var(--text-muted)] opacity-20 uppercase tracking-tighter text-center px-4">No Image</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 backdrop-blur-sm">
                          <ImageIcon size={20} className="text-white mx-auto mb-1" />
                          <p className="text-[8px] font-black uppercase tracking-widest mb-2 text-white">Update Image URL</p>
                          <input 
                            type="text" 
                            placeholder="Paste URL..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-[10px] text-white placeholder:text-white/30 outline-none focus:border-[var(--accent)]/50"
                            value={editForm.image || ''}
                            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Zap size={14} className="text-amber-400" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Store Visibility</h4>
                         </div>
                         <motion.button 
                          disabled={!isEditing}
                          onClick={() => setEditForm({ ...editForm, showInEcom: !editForm.showInEcom })}
                          whileHover={isEditing ? { scale: 1.05 } : {}}
                          whileTap={isEditing ? { scale: 0.95 } : {}}
                          className={cn(
                            "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-resin",
                            editForm.showInEcom 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          )}
                         >
                           {editForm.showInEcom ? <><Eye size={12} /> Visible in Store</> : <><EyeOff size={12} /> Hidden in Store</>}
                         </motion.button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Product Code</label>
                            <input 
                              disabled={!isEditing}
                              type="text" 
                              value={editForm.article} 
                              onChange={(e) => setEditForm({ ...editForm, article: e.target.value })}
                              className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[var(--accent)]/50 focus:bg-[var(--card-bg)] transition-all text-[var(--text-primary)]" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Category</label>
                            <input 
                              disabled={!isEditing}
                              type="text" 
                              value={editForm.category} 
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[var(--accent)]/50 focus:bg-[var(--card-bg)] transition-all text-[var(--text-primary)]" 
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Product Name</label>
                          <input 
                            disabled={!isEditing}
                            type="text" 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[var(--accent)]/50 focus:bg-[var(--card-bg)] transition-all text-[var(--text-primary)]" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </ResinCard>

                {/* Financial Controls */}
                <ResinCard className="p-6 md:p-8" glowingColor="rgba(16,185,129,0.12)">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className="text-emerald-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Pricing</h4>
                    </div>
                    {editForm.price > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      >
                        {(((editForm.price - editForm.purchasePrice) / editForm.price) * 100).toFixed(0)}% MARGIN
                      </motion.div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Cost Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-black">৳</span>
                        <input 
                          disabled={!isEditing}
                          type="number" 
                          min="0"
                          value={editForm.purchasePrice} 
                          onChange={(e) => setEditForm({ ...editForm, purchasePrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3.5 pl-9 pr-4 text-sm font-black outline-none focus:border-emerald-500/50 focus:bg-[var(--card-bg)] transition-all text-[var(--text-primary)]" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Selling Price</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-black">৳</span>
                         <input 
                          disabled={!isEditing}
                          type="number" 
                          min="0"
                          value={editForm.price} 
                          onChange={(e) => setEditForm({ ...editForm, price: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3.5 pl-9 pr-4 text-sm font-black outline-none focus:border-emerald-500/50 focus:bg-[var(--card-bg)] transition-all text-emerald-400" 
                         />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/20 uppercase ml-1">Tax %</label>
                      <input 
                        disabled={!isEditing}
                        type="number" 
                        min="0"
                        value={editForm.tax} 
                        onChange={(e) => setEditForm({ ...editForm, tax: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Price Multiplier</label>
                      <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3.5 px-4 text-sm font-black flex items-center justify-center opacity-50 text-[var(--text-muted)]">
                         1.0x <Zap size={10} className="ml-2" />
                      </div>
                    </div>
                  </div>
                </ResinCard>

                {/* Variant Manager */}
                <ResinCard className="lg:col-span-2 p-6 md:p-8" glowingColor="rgba(249,115,22,0.12)">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
                        <Layers size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tighter text-[var(--text-primary)]">Color & Size Options</h4>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Colors & Sizes</p>
                      </div>
                    </div>
                    {isEditing && (
                      <LiquidButton 
                        onClick={addVariant}
                        className="h-10 px-6 text-[10px]"
                      >
                        <Plus size={16} className="mr-2" /> Add Variant
                      </LiquidButton>
                    )}
                  </div>

                  <div className="space-y-6">
                    <AnimatePresence>
                      {editForm.variants.length > 0 ? (
                        editForm.variants.map((variant, vIdx) => (
                          <motion.div 
                            key={vIdx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: vIdx * 0.1 }}
                            className="p-6 rounded-[2rem] bg-[var(--background)]/20 border border-[var(--card-border)] space-y-6 relative overflow-hidden group/variant hover:bg-[var(--background)]/30 transition-colors shadow-resin"
                          >
                             {isEditing && (
                               <motion.button 
                                whileHover={{ scale: 1.1, color: "#f43f5e", backgroundColor: "rgba(244,63,94,0.1)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeVariant(vIdx)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-white/20 transition-all z-20"
                               >
                                 <Trash2 size={18} />
                               </motion.button>
                             )}
                             
                             <div className="flex flex-col lg:flex-row gap-8">
                                <div className="w-full lg:w-1/3 space-y-5">
                                   <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-orange-300/50">
                                        <Palette size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Color Name</span>
                                      </div>
                                      <input 
                                        disabled={!isEditing}
                                        type="text" 
                                        value={variant.color} 
                                        onChange={(e) => updateVariant(vIdx, 'color', e.target.value)}
                                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:border-[var(--accent)]/50 text-[var(--text-primary)]" 
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-orange-300/50">
                                        <ImageIcon size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Variant Image URL</span>
                                      </div>
                                      <input 
                                        disabled={!isEditing}
                                        type="text" 
                                        placeholder="Paste high-res URL..."
                                        value={variant.image || ''} 
                                        onChange={(e) => updateVariant(vIdx, 'image', e.target.value)}
                                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:border-[var(--accent)]/50 text-[var(--text-primary)]" 
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-orange-300/50">
                                        <Zap size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Style Tags</span>
                                      </div>
                                      <input 
                                        disabled={!isEditing}
                                        type="text" 
                                        placeholder="Add styles..."
                                        value={variant.styles.join(', ')} 
                                        onChange={(e) => updateVariant(vIdx, 'styles', e.target.value.split(',').map(s => s.trim()))}
                                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:border-orange-500/50 text-[var(--text-primary)]" 
                                      />
                                   </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                   <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2 text-indigo-300/50">
                                        <Ruler size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sizes & Stock</span>
                                      </div>
                                      {isEditing && (
                                         <div className="flex items-center gap-2">
                                           {/* Presets */}
                                           <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                                              {[
                                                { label: '36-45', range: [36, 45], tint: 'var(--accent)' },
                                                { label: '27-35', range: [27, 35], tint: 'emerald' },
                                                { label: '20-26', range: [20, 26], tint: 'rose' }
                                              ].map((p) => (
                                                <button
                                                  key={p.label}
                                                  onClick={() => bulkAddSizes(vIdx, p.range[0], p.range[1])}
                                                  className="px-2 py-1 rounded-lg hover:bg-white/10 text-[8px] font-black uppercase transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                >
                                                  {p.label}
                                                </button>
                                              ))}
                                           </div>

                                           <motion.button 
                                             whileHover={{ scale: 1.05 }}
                                             whileTap={{ scale: 0.95 }}
                                             onClick={() => addSize(vIdx)}
                                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all shadow-sm"
                                           >
                                             <Plus size={12} strokeWidth={3} />
                                             <span className="text-[9px] font-black uppercase tracking-widest">Custom</span>
                                           </motion.button>
                                         </div>
                                       )}
                                   </div>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                      {variant.sizes.map((sz, sIdx) => (
                                        <motion.div 
                                          key={sIdx} 
                                          whileHover={{ scale: 1.02, backgroundColor: "var(--card-bg)" }}
                                          className="bg-[var(--card-bg)]/40 p-4 rounded-2xl border border-[var(--card-border)] space-y-3 group/size relative"
                                        >
                                           <div className="flex items-center justify-between gap-2">
                                              <input 
                                                disabled={!isEditing}
                                                placeholder="e.g. 42"
                                                className="bg-[var(--input-bg)] border border-[var(--card-border)] w-full rounded-lg py-1.5 px-3 text-[10px] font-black uppercase outline-none focus:border-[var(--accent)]/30 text-[var(--text-primary)] transition-all"
                                                value={sz.size}
                                                onChange={(e) => {
                                                  const newSizes = [...variant.sizes];
                                                  newSizes[sIdx].size = e.target.value;
                                                  updateVariant(vIdx, 'sizes', newSizes);
                                                }}
                                              />
                                              {isEditing && (
                                                 <motion.button 
                                                   whileHover={{ scale: 1.2 }}
                                                   onClick={() => {
                                                     const newSizes = [...variant.sizes];
                                                     newSizes.splice(sIdx, 1);
                                                     updateVariant(vIdx, 'sizes', newSizes);
                                                   }}
                                                   className="w-5 h-5 rounded-md flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 transition-all hover:text-white border border-rose-500/20"
                                                 >
                                                   <X size={10} strokeWidth={3} />
                                                 </motion.button>
                                              )}
                                           </div>
                                           <div className="grid grid-cols-2 gap-2 mt-2">
                                               <div className="space-y-1">
                                                  <span className="text-[8px] font-black text-[var(--text-muted)] uppercase opacity-50">Pairs in Stock</span>
                                                  <input 
                                                    disabled={!isEditing}
                                                    type="number" 
                                                    className="w-full bg-[var(--input-bg)]/50 border border-[var(--card-border)] rounded-xl py-2 px-3 text-[11px] font-black outline-none focus:border-[var(--accent)]/30 text-[var(--text-primary)] transition-all"
                                                    value={sz.stock}
                                                    onChange={(e) => {
                                                      const newSizes = [...variant.sizes];
                                                      newSizes[sIdx].stock = Math.max(0, parseInt(e.target.value) || 0);
                                                      updateVariant(vIdx, 'sizes', newSizes);
                                                    }}
                                                  />
                                               </div>
                                               <div className="space-y-1">
                                                  <span className="text-[8px] font-black text-[var(--text-muted)] uppercase">Price (+/-)</span>
                                                  <input 
                                                    disabled={!isEditing}
                                                    type="number" 
                                                    className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-[var(--accent)]/30 text-[var(--text-primary)]"
                                                    value={sz.priceAdjustment}
                                                    onChange={(e) => {
                                                      const newSizes = [...variant.sizes];
                                                      newSizes[sIdx].priceAdjustment = parseFloat(e.target.value) || 0;
                                                      updateVariant(vIdx, 'sizes', newSizes);
                                                    }}
                                                  />
                                               </div>
                                            </div>
                                        </motion.div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-20 border-2 border-dashed border-[var(--card-border)] rounded-[3rem] flex flex-col items-center justify-center text-[var(--text-muted)] bg-[var(--card-bg)]">
                           <Layers size={40} className="mb-4 opacity-10" />
                           <p className="text-xs font-black uppercase tracking-[0.2em]">No Variants Added</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </ResinCard>

                {/* Stock Materialization (Visual Slider) */}
                <ResinCard className="lg:col-span-2 p-8 md:p-10 overflow-hidden relative" glowingColor="rgba(99,102,241,0.2)">
                   <div className="flex items-center justify-between mb-10 relative z-10">
                     <div className="flex items-center gap-3">
                       <ShieldCheck size={20} className="text-[var(--accent)]" />
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-none">Stock Level</h4>
                     </div>
                     <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_12px_var(--accent-glow)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">Synchronized</span>
                     </div>
                   </div>

                   <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                      <div className="w-full flex-1">
                        <div className="relative h-2.5 w-full bg-[var(--background)]/20 border border-[var(--card-border)] rounded-full overflow-hidden mb-8">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.min((editForm.stock / 200) * 100, 100)}%` }}
                             className="h-full bg-gradient-to-r from-[var(--accent)] to-indigo-600 shadow-[0_0_20px_var(--accent-glow)]"
                           />
                        </div>
                        <div className="relative">
                          <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            value={editForm.stock} 
                            onChange={handleStockChange}
                            className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-[var(--accent)] relative z-10"
                          />
                          <div className="absolute inset-0 bg-[var(--accent)]/10 blur-xl opacity-20 -z-10" />
                        </div>
                           <div className="flex flex-col">
                             <span className={cn("text-4xl font-black tracking-tighter transition-colors leading-none", isEditing ? "text-[var(--accent)]" : "text-[var(--text-primary)]")}>{editForm.stock}</span>
                             <span className="text-[10px] font-black text-[var(--text-muted)] opacity-20 uppercase tracking-widest mt-2">Units in Stock</span>
                           </div>
                           <div className="flex gap-4">
                              <MiniStat title="Efficiency" value="98%" color="text-[var(--accent)] opacity-60" />
                              <MiniStat title="Status" value="LIVE" color="text-emerald-400/60" />
                           </div>
                      </div>
                      
                      <div className="w-36 h-36 rounded-[3rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col items-center justify-center shadow-resin overflow-hidden relative shrink-0">
                         <motion.div 
                          animate={{ 
                            y: [0, -8, 0],
                            rotate: [0, 2, 0]
                          }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--accent)]/50 to-[var(--accent)]/10 border-t border-[var(--accent)]/40" 
                          style={{ height: `${Math.min((editForm.stock / 200) * 100, 100)}%` }} 
                         />
                         <div className="relative z-10 text-center">
                            <span className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">{((editForm.stock / 200) * 100).toFixed(0)}%</span>
                            <p className="text-[8px] font-black text-[var(--text-muted)] opacity-40 uppercase tracking-widest mt-1">Full</p>
                         </div>
                      </div>
                   </div>
                </ResinCard>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-[var(--text-muted)] opacity-10">
             <motion.div
               animate={{ 
                 y: [0, -20, 0],
                 opacity: [0.03, 0.08, 0.03],
                 scale: [1, 1.05, 1],
                 rotate: [0, 5, 0]
               }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             >
               <Package size={160} className="mb-6" />
             </motion.div>
             <h3 className="text-lg font-black uppercase tracking-[0.3em] opacity-20">Products</h3>
             <p className="text-xs font-bold uppercase tracking-widest opacity-10 mt-2">Select a product to view details</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
