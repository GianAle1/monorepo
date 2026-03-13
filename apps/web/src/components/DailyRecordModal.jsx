import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CutEntry from '@/components/CutEntry.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast';

const DailyRecordModal = ({ selectedDate, existingRecord, onClose, onSave }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [worked, setWorked] = useState(existingRecord?.worked || false);
  const [cuts, setCuts] = useState(existingRecord?.cuts || [{ payment_method: 'Yape', amount: 0 }]);
  const [loading, setLoading] = useState(false);

  const dateStr = selectedDate.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const calculateTotals = () => {
    const totalYape = cuts
      .filter(cut => cut.payment_method === 'Yape')
      .reduce((sum, cut) => sum + (parseFloat(cut.amount) || 0), 0);
    
    const totalCash = cuts
      .filter(cut => cut.payment_method === 'Efectivo')
      .reduce((sum, cut) => sum + (parseFloat(cut.amount) || 0), 0);
    
    const totalEarnings = totalYape + totalCash;

    return { totalYape, totalCash, totalEarnings };
  };

  const handleCutChange = (index, updatedCut) => {
    const newCuts = [...cuts];
    newCuts[index] = updatedCut;
    setCuts(newCuts);
  };

  const handleDeleteCut = (index) => {
    if (cuts.length > 1) {
      setCuts(cuts.filter((_, i) => i !== index));
    }
  };

  const handleAddCut = () => {
    setCuts([...cuts, { payment_method: 'Yape', amount: 0 }]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { totalYape, totalCash, totalEarnings } = calculateTotals();
      const dateISOStr = selectedDate.toISOString().split('T')[0];

      const recordData = {
        date: dateISOStr,
        worked,
        cuts: worked ? cuts : [],
        total_yape: worked ? totalYape : 0,
        total_cash: worked ? totalCash : 0,
        total_earnings: worked ? totalEarnings : 0,
        userId: currentUser.id
      };

      if (existingRecord) {
        await pb.collection('daily_records').update(existingRecord.id, recordData, { $autoCancel: false });
        toast({
          title: 'Registro actualizado',
          description: 'Los datos se guardaron correctamente'
        });
      } else {
        await pb.collection('daily_records').create(recordData, { $autoCancel: false });
        toast({
          title: 'Registro creado',
          description: 'Los datos se guardaron correctamente'
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el registro',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const { totalYape, totalCash, totalEarnings } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registro Diario</h2>
            <p className="text-sm text-gray-600 mt-1 capitalize">{dateStr}</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-900">¿Trabajé hoy?</span>
            <button
              onClick={() => setWorked(!worked)}
              className={`
                relative w-14 h-8 rounded-full transition-colors duration-200
                ${worked ? 'bg-gray-900' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  absolute top-1 left-1 w-6 h-6 bg-white rounded-full
                  transition-transform duration-200
                  ${worked ? 'translate-x-6' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          {worked && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Cortes realizados</h3>
                  <span className="text-sm text-gray-600">{cuts.length} corte{cuts.length !== 1 ? 's' : ''}</span>
                </div>

                {cuts.map((cut, index) => (
                  <CutEntry
                    key={index}
                    cut={cut}
                    index={index}
                    onChange={handleCutChange}
                    onDelete={handleDeleteCut}
                  />
                ))}

                <Button
                  type="button"
                  onClick={handleAddCut}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar corte
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 mb-3">Resumen</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Yape:</span>
                  <span className="font-medium text-gray-900">S/ {totalYape.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Efectivo:</span>
                  <span className="font-medium text-gray-900">S/ {totalCash.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Ganancias:</span>
                    <span className="font-bold text-gray-900 text-lg">S/ {totalEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gray-900 hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyRecordModal;