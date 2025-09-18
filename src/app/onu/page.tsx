"use client";

import OnuListTable from "@/components/onu-list-table";
import PonPortOverviewTable from "@/components/pon-port-overview-table";

export default function OnuList() {
  return (
    <div className="flex flex-col m-2 gap-4 w-full">
      <PonPortOverviewTable />
      <OnuListTable />
    </div>
  );
}
