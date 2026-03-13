import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const DEFAULT_CATEGORIES = [
  'Gimnasio',
  'Gastos personales',
  'Comida',
  'Transporte',
  'Productos de barbería',
  'Herramientas',
  'Alquiler del local',
  'Otros'
];

const ExpensesTab = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    fetchExpenses();
  }, [currentUser]);

  const fetchExpenses = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const records = await pb.collection('expenses').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-date',
        $autoCancel: false
      });
      setExpenses(records);
      
      // Extract unique custom categories
      const customCats = records
        .map(r => r.category)
        .filter(c => !DEFAULT_CATEGORIES.includes(c));
      
      if (customCats.length > 0) {
        setCategories([...new Set([...DEFAULT_CATEGORIES, ...customCats])]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los gastos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setEditingId(expense.id);
      const isDefault = DEFAULT_CATEGORIES.includes(expense.category);
      setFormData({
        category: isDefault ? expense.category : 'Custom',
        customCategory: isDefault ? '' : expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date.split(' ')[0]
      });
    } else {
      setEditingId(null);
      setFormData({
        category: '',
        customCategory: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalCategory = formData.category === 'Custom' ? formData.customCategory : formData.category;
    
    if (!finalCategory || !formData.description || !formData.amount || !formData.date) {
      toast({ title: 'Error', description: 'Por favor completa todos los campos', variant: 'destructive' });
      return;
    }

    const data = {
      userId: currentUser.id,
      category: finalCategory,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date + ' 12:00:00.000Z' // Append time to make it a valid PB date
    };

    try {
      if (editingId) {
        await pb.collection('expenses').update(editingId, data, { $autoCancel: false });
        toast({ title: 'Éxito', description: 'Gasto actualizado correctamente' });
      } else {
        await pb.collection('expenses').create(data, { $autoCancel: false });
        toast({ title: 'Éxito', description: 'Gasto registrado correctamente' });
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({ title: 'Error', description: 'No se pudo guardar el gasto', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;
    try {
      await pb.collection('expenses').delete(id, { $autoCancel: false });
      toast({ title: 'Éxito', description: 'Gasto eliminado' });
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar el gasto', variant: 'destructive' });
    }
  };

  // Group expenses by category
  const groupedExpenses = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) acc[expense.category] = [];
    acc[expense.category].push(expense);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mis Gastos</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()} className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="Custom">Otra (Especificar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.category === 'Custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nueva Categoría</label>
                  <Input 
                    value={formData.customCategory}
                    onChange={(e) => setFormData({...formData, customCategory: e.target.value})}
                    placeholder="Ej. Suscripciones"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ej. Compra de navajas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto (S/)</label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6">
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No has registrado ningún gasto aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">{category}</h3>
                <span className="font-bold text-gray-900">
                  S/ {items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map(expense => (
                  <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.date.split(' ')[0]}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900">S/ {expense.amount.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(expense)} className="h-8 w-8 p-0">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)} className="h-8 w-8 p-0 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;