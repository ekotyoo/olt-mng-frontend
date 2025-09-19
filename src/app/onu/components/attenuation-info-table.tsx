"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getAttenuationInfo } from "@/app/actions/telnet";
import { LoaderCircle } from "lucide-react";

function getStatusColor(value: number | null) {
  if (value === null || value < -1000) return "bg-red-500";
  if (value <= -30) return "bg-red-500";
  if (value <= -28) return "bg-yellow-500";
  if (value < -8) return "bg-green-500";

  return "bg-gray-400";
}

function ValueWithCircle({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`inline-block h-3 w-3 rounded-full ${getStatusColor(value)}`} />
      {label}: {value} (dBm)
    </div>
  );
}

export default function AttenuationInfoTable({
  onuId,
  slotPort,
}: {
  onuId: string;
  slotPort: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [attenuationInfo, setAttenuationInfo] = useState<AttenuationInfo>([]);

  useEffect(() => {
    initAttenuationInfo();
  }, []);

  async function initAttenuationInfo() {
    setIsLoading(true);
    try {
      const result = await getAttenuationInfo({ onuId: onuId, slotPort: slotPort });
      setAttenuationInfo(result);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading)
    return (
      <div className="flex h-[100px] items-center justify-center">
        <LoaderCircle className="size-10 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="truncate px-2 py-1">Direction</TableHead>
            <TableHead className="truncate px-2 py-1">OLT</TableHead>
            <TableHead className="truncate px-2 py-1">ONU</TableHead>
            <TableHead className="truncate px-2 py-1">Attenuation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attenuationInfo.map((row) => (
            <TableRow key={row.direction}>
              {/* Direction */}
              <TableCell>{row.direction}</TableCell>

              {/* OLT column */}
              <TableCell>
                {row.direction === "up" ? (
                  <ValueWithCircle label="Rx" value={row.rx} />
                ) : (
                  <ValueWithCircle label="Tx" value={row.tx} />
                )}
              </TableCell>

              {/* ONU column */}
              <TableCell>
                {row.direction === "up" ? (
                  <ValueWithCircle label="Tx" value={row.tx} />
                ) : (
                  <ValueWithCircle label="Rx" value={row.rx} />
                )}
              </TableCell>

              {/* Attenuation */}
              <TableCell className=" flex items-center gap-2">
                <div
                  className={`inline-block h-3 w-3 rounded-full ${getStatusColor(row.attenuation)}`}
                />
                {row.attenuation} (dB)
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
