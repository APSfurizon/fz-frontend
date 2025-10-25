'use client'

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
    return (
        <div className="main-dialog rounded-s">
            {children}
        </div>
    );
  }