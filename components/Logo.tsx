import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        width={32}
        height={32}
        src="/amway-svg.svg"
        alt="Amway Logo"
        className="h-8 w-auto"
      />
    </div>
  );
}
