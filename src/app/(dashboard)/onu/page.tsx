"use client";

import OnuListTable from "./components/onu-list-table";
import PonPortOverviewTable from "./components/pon-port-overview-table";

export default function OnuList() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1 min-w-0 overflow-x-auto">
        <PonPortOverviewTable />
      </div>
      <div className="md:col-span-2 min-w-0 overflow-x-auto">
        <OnuListTable />
      </div>
    </div>
  );
}
