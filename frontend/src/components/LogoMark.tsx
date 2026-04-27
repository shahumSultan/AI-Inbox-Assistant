import Image from "next/image";

export default function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={size}
      height={size}
      priority
      unoptimized
    />
  );
}
