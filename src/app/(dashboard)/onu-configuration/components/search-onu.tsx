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
  onOnuClick = () => { },
  onSelectOlt = () => { },
  isLoading = false,
  onus = [],
  selectedOnu,
  selectedOlt,
  oltOptions = [],
}: {
  onOnuClick?: (onu: Onu) => void;
  onSelectOlt?: (olt: string) => void;
  isLoading?: boolean;
  onus?: Onu[];
  selectedOnu?: Onu | null;
  selectedOlt?: string | null;
  oltOptions?: { label: string; value: string }[];
}) {

  return (
    <Card className="w-full flex flex-col gap-4">
      <CardHeader>
        <CardTitle>Provision New</CardTitle>
      </CardHeader>

      <CardContent>
        <Select onValueChange={onSelectOlt} value={selectedOlt || undefined}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select OLT" />
          </SelectTrigger>
          <SelectContent>
            {(oltOptions || []).map((olt) => (
              <SelectItem key={olt.value} value={olt.value}>
                {olt.label}
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
