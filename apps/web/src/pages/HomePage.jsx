import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Scissors, Calendar, TrendingUp, DollarSign } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <>
      <Helmet>
        <title>BarberTracker - Gestiona tus ganancias diarias</title>
        <meta name="description" content="Aplicación para barberos que permite registrar cortes diarios, métodos de pago y calcular ganancias totales de forma simple y eficiente." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1582483720544-4068701c073d)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Scissors className="w-12 h-12 text-white" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
                BarberTracker
              </h1>
            </div>
            
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Gestiona tus cortes diarios y ganancias de forma simple y eficiente
            </p>
            
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 h-auto font-semibold shadow-xl"
            >
              Comenzar
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Todo lo que necesitas
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Herramientas diseñadas específicamente para barberos profesionales
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Calendario Visual
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualiza tus días trabajados con un calendario intuitivo. Identifica rápidamente los días con registros.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Registro de Pagos
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Registra cada corte con su método de pago (Yape o Efectivo) y monto. Cálculos automáticos de totales.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Análisis de Ganancias
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualiza tus ganancias totales separadas por método de pago. Toma decisiones informadas sobre tu negocio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Comienza a gestionar tus ganancias hoy
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a los barberos que ya están optimizando su negocio
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 h-auto font-semibold"
            >
              Comenzar gratis
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;