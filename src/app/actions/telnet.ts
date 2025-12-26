"use server";

import { parseAttenuationInfo, parseOltCard, parseOltCardDetail, parseOnuDetails, parseOnuState, parseSystemGroup } from "@/lib/olt-parser";
import { runOltCommand, runOltSession } from "@/lib/telnet-service";
import { OltCardDetail, OnuDetails, PonPortOverview } from "@/lib/type";

export async function runTelnetCommand(command: string): Promise<string> {
  return await runOltCommand(command);
}

export async function getAllOnuDetails(): Promise<OnuDetails[]> {
  const res = await runTelnetCommand("show running");
  const onuList = parseOnuDetails(res);

  return onuList;
}

export async function getPonPortOverview(): Promise<PonPortOverview[]> {
  const result = await runTelnetCommand("show gpon onu state");
  const data = parseOnuState(result);

  return data;
}

export async function getAttenuationInfo({ slotPort, onuId }: { slotPort: string, onuId: string }) {
  const result = await runTelnetCommand(`show pon power attenuation gpon-onu_${slotPort}:${onuId}`);
  const data = parseAttenuationInfo(result);

  return data;
}

export async function getOltInfo() {
  const result = await runTelnetCommand("show system-group");
  const data = parseSystemGroup(result)

  return data;
}

export async function getOltCardStats() {
  return await runOltSession(async (session) => {
    const result = await session.sendCommand("show card");
    const oltCards = parseOltCard(result);

    const data: OltCardDetail[] = [];

    for (const oltCard of oltCards) {
      const detailRaw = await session.sendCommand(`show card rack ${oltCard.rack} shelf ${oltCard.shelf} slot ${oltCard.slot}`);
      const detail = parseOltCardDetail(detailRaw, oltCard.rack, oltCard.shelf, oltCard.slot);

      data.push(detail);
    }

    return data;
  })
}