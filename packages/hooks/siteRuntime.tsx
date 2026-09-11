'use client';

import { createContext, useContext } from 'react';
import type { ProjectConfig } from '@saas/configs/base.config';
import { clientConfig as defaultConfig } from '@saas/configs/site';

const SiteConfigContext = createContext<ProjectConfig>(defaultConfig);

export function SiteConfigProvider({
  config,
  children,
}: {
  config?: ProjectConfig;
  children: React.ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={config ?? defaultConfig}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): ProjectConfig {
  return useContext(SiteConfigContext);
}
