import OltForm from "../components/olt-form";

export default function NewOltPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Add OLT</h1>
            <OltForm />
        </div>
    );
}
