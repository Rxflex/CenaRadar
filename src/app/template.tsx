import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <div className="t-page-enter flex-1 flex flex-col">{children}</div>;
}
