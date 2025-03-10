declare namespace chrome {
    export namespace tabs {
      export interface Tab {
        id?: number;
        url?: string;
        title?: string;
      }
  
      export function query(queryInfo: {
        active: boolean;
        currentWindow: boolean;
      }): Promise<Tab[]>;
  
      export function getSelected(windowId: number | null, callback: (tab: Tab) => void): void;
  
      export const onActivated: {
        addListener(callback: (activeInfo: { tabId: number; windowId: number }) => void): void;
        removeListener(callback: (activeInfo: { tabId: number; windowId: number }) => void): void;
      };
  
      export const onSelectionChanged: {
        addListener(callback: (tabId: number, selectInfo: object) => void): void;
        removeListener(callback: (tabId: number, selectInfo: object) => void): void;
      };
    }
  }