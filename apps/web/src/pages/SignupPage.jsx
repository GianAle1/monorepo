import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', passwordConfirm: '' });
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (field, value) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'passwordConfirm') setPasswordConfirm(value);

    // Clear specific field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({ email: '', password: '', passwordConfirm: '' });

    let hasErrors = false;
    const newFieldErrors = { email: '', password: '', passwordConfirm: '' };

    // 1. Email format validation
    if (!validateEmail(email)) {
      newFieldErrors.email = 'Formato de email inválido';
      hasErrors = true;
    }

    // 2. Password length validation
    if (password.length < 8) {
      newFieldErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      hasErrors = true;
    }

    // 3. Password confirmation validation
    if (password !== passwordConfirm) {
      newFieldErrors.passwordConfirm = 'Las contraseñas no coinciden';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);

    const result = await signup(email, password, passwordConfirm, name);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      // Capture and display specific errors from AuthContext
      if (result.error === 'Este email ya está registrado' || result.error === 'Formato de email inválido') {
        setFieldErrors(prev => ({ ...prev, email: result.error }));
      } else {
        setGeneralError(result.error);
      }
    }
    
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Registrarse - BarberTracker</title>
        <meta name="description" content="Crea tu cuenta en BarberTracker y comienza a gestionar tus cortes y ganancias diarias." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Scissors className="w-10 h-10 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">BarberTracker</h1>
          </div>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-gray-900 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {generalError}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="tu@email.com"
                />
                {fieldErrors.email && (
                  <div className="mt-1">
                    <p className="text-xs text-red-600">{fieldErrors.email}</p>
                    {fieldErrors.email === 'Este email ya está registrado' && (
                      <Link to="/login" className="text-xs text-gray-900 font-medium hover:underline mt-1 inline-block">
                        ¿Ya tienes cuenta? Inicia sesión aquí
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="••••••••"
                />
                {fieldErrors.password ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
                )}
              </div>

              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-900 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 ${fieldErrors.passwordConfirm ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="••••••••"
                />
                {fieldErrors.passwordConfirm && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.passwordConfirm}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 h-auto disabled:opacity-70"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;