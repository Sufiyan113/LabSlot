import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { clsx } from 'clsx';

const Register = () => {
  const { register: registerUser, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', studentId: '', department: '', phone: '' },
  });

  const password = watch('password');
  const strength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;

  const onSubmit = async (data) => {
    clearError();
    setSubmitting(true);
    const { confirmPassword, ...payload } = data;
    const result = await registerUser(payload);
    setSubmitting(false);
    if (result.success) navigate('/student', { replace: true });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Create account</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Register as a student to book lab equipment</p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="label">Full name</label>
          <input className="input" placeholder="Priya Patel" {...register('name', { required: 'Required', minLength: 2 })} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="you@college.edu" {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Student ID</label>
            <input className="input" placeholder="CS2021-042" {...register('studentId')} />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" placeholder="Computer Science" {...register('department')} />
          </div>
        </div>
        <div>
          <label className="label">Phone <span className="text-ink-subtle font-normal">(optional)</span></label>
          <input className="input" placeholder="+91-9876543210" {...register('phone')} />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pr-10"
              placeholder="Min. 6 characters"
              {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle" tabIndex={-1}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={clsx('h-1 flex-1 rounded-full transition-colors', strength >= i ? (strength <= 2 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-border')} />
              ))}
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input type="password" className="input" placeholder="Repeat password" {...register('confirmPassword', { required: 'Required', validate: (v) => v === password || 'Passwords do not match' })} />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 mt-1">
          {submitting ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
