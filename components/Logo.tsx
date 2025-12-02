import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        width={32}
        height={32}
        src="https://images.contentstack.io/v3/assets/blt7fba682eccffca60/blt7b3928c419c237f1/622859f8225c6a0d139d91c1/Black.svg"
        alt="Amway Logo"
        className="h-8 w-auto "
      />
    </div>
  );
}
