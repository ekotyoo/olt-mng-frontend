import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileForm from "./components/profile-form";

export default async function ProfilePage() {
    const session = await getSession();
    if (!session || !session.userId) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true }
    });

    if (!user) redirect("/login");

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <ProfileForm user={user} />
        </div>
    );
}
