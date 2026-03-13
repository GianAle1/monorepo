import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const SavingsGoalsTab = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    deadline: ''
  });

  useEffect(() => {
    fetchGoals();
  }, [currentUser]);

  const fetchGoals = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const records = await pb.collection('savings_goals').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: 'deadline',
        $autoCancel: false
      });
      setGoals(records);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los objetivos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingId(goal.id);
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        deadline: goal.deadline.split(' ')[0]
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target_amount || !formData.deadline) {
      toast({ title: 'Error', description: 'Por favor completa los campos obligatorios', variant: 'destructive' });
      return;
    }

    const data = {
      userId: currentUser.id,
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
      deadline: formData.deadline + ' 12:00:00.000Z'
    };

    try {
      if (editingId) {
        await pb.collection('savings_goals').update(editingId, data, { $autoCancel: false });
        toast({ title: 'Éxito', description: 'Objetivo actualizado' });
      } else {
        await pb.collection('savings_goals').create(data, { $autoCancel: false });
        toast({ title: 'Éxito', description: 'Objetivo creado' });
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({ title: 'Error', description: 'No se pudo guardar el objetivo', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este objetivo?')) return;
    try {
      await pb.collection('savings_goals').delete(id, { $autoCancel: false });
      toast({ title: 'Éxito', description: 'Objetivo eliminado' });
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar el objetivo', variant: 'destructive' });
    }
  };

  const handleAddFunds = async (goal, amountToAdd) => {
    const newAmount = (goal.current_amount || 0) + amountToAdd;
    try {
      await pb.collection('savings_goals').update(goal.id, { current_amount: newAmount }, { $autoCancel: false });
      toast({ title: 'Éxito', description: 'Fondos añadidos al objetivo' });
      fetchGoals();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron añadir los fondos', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Objetivos de Ahorro</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()} className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo Objetivo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Objetivo' : 'Crear Nuevo Objetivo'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del objetivo</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej. Nueva máquina de cortar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta (S/)</label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ahorro actual (S/)</label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha límite</label>
                <Input 
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
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
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tienes objetivos de ahorro configurados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const progress = Math.min(100, Math.round(((goal.current_amount || 0) / goal.target_amount) * 100));
            const remaining = goal.target_amount - (goal.current_amount || 0);
            
            return (
              <div key={goal.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{goal.name}</h3>
                    <p className="text-sm text-gray-500">Meta: S/ {goal.target_amount.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(goal)} className="h-8 w-8 p-0">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)} className="h-8 w-8 p-0 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">S/ {(goal.current_amount || 0).toFixed(2)}</span>
                    <span className="text-gray-500">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm">
                    <span className="text-gray-500 block">Falta:</span>
                    <span className="font-medium text-gray-900">S/ {Math.max(0, remaining).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-right">
                    <span className="text-gray-500 block">Límite:</span>
                    <span className="font-medium text-gray-900">{goal.deadline.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavingsGoalsTab;