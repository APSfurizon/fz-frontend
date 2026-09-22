import Footer from "@/components/common/footer";
import HeaderHolder from "@/components/common/header/headerHolder";
import Providers from "@/components/context/mainProviders";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Providers>
        <HeaderHolder />
        {children}
        <div className="spacer"></div>
        <Footer />
      </Providers>
      <div id="portal-root"></div>
    </>
  );
}
