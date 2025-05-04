export function Header1() {
  return (
    <div className="col-span-full row-span-1 grid grid-cols-8 gap-px">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="bg-background col-span-4 h-24" />
      ))}
    </div>
  )
}
