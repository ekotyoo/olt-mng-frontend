import OltForm from "../components/olt-form";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditOltPage({ params }: { params: { id: string } }) {
    const olt = await prisma.olt.findUnique({
        where: { id: params.id }
    });

    if (!olt) return notFound();

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Edit OLT</h1>
            <OltForm initialData={olt} />
        </div>
    );
}
