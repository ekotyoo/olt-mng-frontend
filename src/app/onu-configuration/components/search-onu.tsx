"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Onu } from "@/lib/type";

export default function SearchOnu({
  onOnuClick = () => {},
  onSelectOlt = () => {},
  isLoading = false,
  onus = [],
  selectedOnu,
}: {
  onOnuClick?: (onu: Onu) => void;
  onSelectOlt?: (olt: string) => void;
  isLoading?: boolean;
  onus?: Onu[];
  selectedOnu?: Onu | null;
}) {
  const olts = [
    {
      ip: "192.168.220.22",
      name: "OLT 1",
      olt_key: "olt1",
    },
    {
      ip: "192.168.220.22",
      name: "OLT 2",
      olt_key: "olt2",
    },
  ];

  return (
    <Card className="w-full flex flex-col gap-4">
      <CardHeader>
        <CardTitle>Scan ONU</CardTitle>
      </CardHeader>

      <CardContent>
        <Select onValueChange={onSelectOlt}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select OLT" />
          </SelectTrigger>
          <SelectContent>
            {olts.map((olt) => (
              <SelectItem key={olt.olt_key} value={olt.olt_key}>
                {olt.name}/{olt.ip}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <LoaderCircle className="mx-auto mt-4 text-blue-500 animate-spin" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Slot/Port</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(onus) && onus.length > 0 ? (
                onus.map((onu) => (
                  <TableRow key={onu.serial}>
                    <TableCell className="font-medium">{onu.slot_port}</TableCell>
                    <TableCell>{onu.serial}</TableCell>
                    <TableCell align="center">
                      <Button
                        className="flex"
                        variant={selectedOnu === onu ? "default" : "outline"}
                        size={"icon"}
                        onClick={() => {
                          onOnuClick(onu);
                        }}
                      >
                        <CheckCircle2
                          className={selectedOnu === onu ? "text-background" : "text-foreground"}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No Data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
