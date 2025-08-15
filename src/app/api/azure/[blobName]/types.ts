export type OnlyOfficeCallbackType = {
  key: string;
  status: number;
  url?: string;
  users?: string[];
  actions?: { type: number; userid: string }[];
  token?: string;
  changesurl: string;
  history: {
    serverVersion: string;
    changes: object[];
  };
  lastsave: string;
  notmodified: boolean;
};
