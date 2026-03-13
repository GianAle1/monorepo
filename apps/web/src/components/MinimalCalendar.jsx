import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const MinimalCalendar = ({ onDayClick }) => {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchRecords();
  }, [currentDate, currentUser]);

  const fetchRecords = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const startOfMonth = new Date(year, month, 1);
      const startOfNextMonth = new Date(year, month + 1, 1);
      
      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = startOfNextMonth.toISOString().split('T')[0];
      
      const fetchedRecords = await pb.collection('daily_records').getFullList({
        filter: `userId = "${currentUser.id}" && date >= "${startDateStr}" && date < "${endDateStr}"`,
        $autoCancel: false
      });
      
      setRecords(fetchedRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(year, month, 1).getDay();
  };

  const hasRecordForDay = (day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return records.some(record => record.date.startsWith(dateStr));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    const selectedDate = new Date(year, month, day);
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existingRecord = records.find(record => record.date.startsWith(dateStr));
    onDayClick(selectedDate, existingRecord);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={previousMonth}
            variant="outline"
            size="sm"
            className="w-9 h-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={nextMonth}
            variant="outline"
            size="sm"
            className="w-9 h-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const hasRecord = hasRecordForDay(day);
          const isToday = isCurrentMonth && today.getDate() === day;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center
                transition-all duration-200 relative
                ${isToday ? 'bg-gray-900 text-white font-bold' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}
                ${hasRecord && !isToday ? 'ring-2 ring-gray-900' : ''}
              `}
            >
              <span className="text-sm">{day}</span>
              {hasRecord && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isToday ? 'bg-white' : 'bg-gray-900'}`} />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default MinimalCalendar;