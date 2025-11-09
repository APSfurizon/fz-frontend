'use client'
import Footer from "@/components/footer"
import Header from '@/components/header';
import { HeaderProvider } from '@/components/context/userProvider';
import { ModalProvider } from '@/components/context/modalProvider';

export default function MainLayout({children}: Readonly<{ children: React.ReactNode }>) {

  return <>
    <HeaderProvider>
        <ModalProvider>
            <Header/>
            {children}
            <div className="spacer"></div>
            <Footer/>
        </ModalProvider>
    </HeaderProvider>
    <div id="portal-root"></div>
  </>;
}
