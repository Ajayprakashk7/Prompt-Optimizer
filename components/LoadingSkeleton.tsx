import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-zinc-800 rounded h-4 w-3/4 mb-2"></div>
    <div className="bg-zinc-800 rounded h-4 w-1/2"></div>
  </div>
);

export const InputSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-zinc-800 rounded-lg h-32 mb-4"></div>
    <div className="flex gap-2">
      <div className="bg-zinc-800 rounded h-10 flex-1"></div>
      <div className="bg-zinc-800 rounded h-10 w-24"></div>
    </div>
  </div>
);

export const HeaderSkeleton: React.FC = () => (
  <div className="animate-pulse flex justify-between items-center p-4 border-b border-zinc-800">
    <div className="bg-zinc-800 rounded h-6 w-32"></div>
    <div className="flex gap-2">
      <div className="bg-zinc-800 rounded h-8 w-8"></div>
      <div className="bg-zinc-800 rounded h-8 w-8"></div>
      <div className="bg-zinc-800 rounded h-8 w-8"></div>
    </div>
  </div>
);

export const FastStartupWrapper: React.FC<{ 
  children: React.ReactNode;
  isLoading: boolean;
}> = ({ children, isLoading }) => {
  if (isLoading) {
    return (
      <div className="extension-container bg-zinc-950">
        <HeaderSkeleton />
        <main className="extension-main p-4">
          <div className="responsive-grid gap-4">
            <div className="responsive-column">
              <InputSkeleton />
            </div>
            <div className="responsive-column">
              <div className="animate-pulse">
                <div className="bg-zinc-800 rounded-lg h-48"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
};
