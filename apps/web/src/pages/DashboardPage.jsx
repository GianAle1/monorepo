import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import MinimalCalendar from '@/components/MinimalCalendar.jsx';
import DailyRecordModal from '@/components/DailyRecordModal.jsx';
import ExpensesTab from '@/components/ExpensesTab.jsx';
import ChartsTab from '@/components/ChartsTab.jsx';
import SavingsGoalsTab from '@/components/SavingsGoalsTab.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Receipt, PieChart, Target } from 'lucide-react';

const DashboardPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDayClick = (date, record) => {
    setSelectedDate(date);
    setExistingRecord(record || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setExistingRecord(null);
  };

  const handleSaveRecord = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - BarberTracker</title>
        <meta name="description" content="Gestiona tus cortes diarios, gastos y visualiza tus ganancias." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mi Dashboard
            </h1>
            <p className="text-gray-600">
              Gestiona tu negocio de forma integral
            </p>
          </div>

          <Tabs defaultValue="inicio" className="space-y-6">
            <TabsList className="bg-white border border-gray-200 p-1 h-auto flex flex-wrap sm:inline-flex">
              <TabsTrigger value="inicio" className="gap-2 py-2.5 px-4 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Inicio</span>
              </TabsTrigger>
              <TabsTrigger value="gastos" className="gap-2 py-2.5 px-4 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Gastos</span>
              </TabsTrigger>
              <TabsTrigger value="graficos" className="gap-2 py-2.5 px-4 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                <PieChart className="w-4 h-4" />
                <span className="hidden sm:inline">Gráficos</span>
              </TabsTrigger>
              <TabsTrigger value="objetivos" className="gap-2 py-2.5 px-4 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Objetivos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inicio" className="focus:outline-none">
              <MinimalCalendar key={refreshKey} onDayClick={handleDayClick} />
            </TabsContent>

            <TabsContent value="gastos" className="focus:outline-none">
              <ExpensesTab />
            </TabsContent>

            <TabsContent value="graficos" className="focus:outline-none">
              <ChartsTab />
            </TabsContent>

            <TabsContent value="objetivos" className="focus:outline-none">
              <SavingsGoalsTab />
            </TabsContent>
          </Tabs>
        </main>

        {showModal && selectedDate && (
          <DailyRecordModal
            selectedDate={selectedDate}
            existingRecord={existingRecord}
            onClose={handleCloseModal}
            onSave={handleSaveRecord}
          />
        )}
      </div>
    </>
  );
};

export default DashboardPage;