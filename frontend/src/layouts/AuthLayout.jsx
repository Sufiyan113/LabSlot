import { Outlet, Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

const AuthLayout = () => (
  <div className="min-h-screen flex bg-surface">
    {/* Brand panel */}
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-950 text-white flex-col justify-between p-12">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>
      <div className="relative">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <FlaskConical className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">LabSlot</span>
        </div>
      </div>
      <div className="relative space-y-4 max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">
          Laboratory resource management, simplified.
        </h1>
        <p className="text-brand-200 text-sm leading-relaxed">
          Book equipment, track availability, and manage lab operations — built for modern university laboratories.
        </p>
        <div className="flex gap-6 pt-4 text-xs text-brand-300">
          <div>
            <p className="text-2xl font-semibold text-white">Real-time</p>
            <p>Availability</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">Conflict-free</p>
            <p>Bookings</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">Role-based</p>
            <p>Access</p>
          </div>
        </div>
      </div>
      <p className="relative text-xs text-brand-400">© LabSlot · College PBL Project</p>
    </div>

    {/* Form panel */}
    <div className="flex-1 flex flex-col">
      <header className="lg:hidden py-5 px-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <FlaskConical className="h-4 w-4" />
        </div>
        <Link to="/" className="text-lg font-semibold text-ink">LabSlot</Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-[400px] animate-slide-up">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

export default AuthLayout;
