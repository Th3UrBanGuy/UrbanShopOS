import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ClientOnly from '@/components/ClientOnly';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-background text-foreground relative">
      {/* Forced Dark Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 50%, var(--bg-gradient-1) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, var(--bg-gradient-2) 0%, transparent 50%)
          `
        }} 
      />
      
      <ClientOnly>
        <div className="relative z-10">
          <Navbar />
          <CartDrawer />
          {children}
          <Footer />
        </div>
      </ClientOnly>
    </div>
  );
}
