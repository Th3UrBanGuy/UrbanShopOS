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
    <ClientOnly>
      <Navbar />
      <CartDrawer />
      {children}
      <Footer />
    </ClientOnly>
  );
}
