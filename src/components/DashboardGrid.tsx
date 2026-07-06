import GridCard from "./GridCard";

export default function DashboardGrid() {
  return (
    <section className="space-y-5 px-4 pb-28 pt-4">
      <div className="grid grid-cols-6 gap-4">
        <GridCard className="col-span-4 aspect-[5/3]" />
        <GridCard className="col-span-2 aspect-[5/6]" />
        <GridCard className="col-span-3 aspect-[5/3]" />
        <GridCard className="col-span-3 aspect-[5/3]" />
        <GridCard className="col-span-6 aspect-[7/3]" />
      </div>
    </section>
  );
}
