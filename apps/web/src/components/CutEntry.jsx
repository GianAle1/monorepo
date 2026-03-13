import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const CutEntry = ({ cut, index, onChange, onDelete }) => {
  const handlePaymentMethodChange = (e) => {
    onChange(index, { ...cut, payment_method: e.target.value });
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    onChange(index, { ...cut, amount: value === '' ? '' : parseFloat(value) || 0 });
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Método
          </label>
          <select
            value={cut.payment_method}
            onChange={handlePaymentMethodChange}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="Yape">Yape</option>
            <option value="Efectivo">Efectivo</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Monto (S/)
          </label>
          <input
            type="number"
            value={cut.amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(index)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CutEntry;