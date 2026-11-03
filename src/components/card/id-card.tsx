import { resolveMemberId } from "@/lib/card/member-id";
import { cssFontFamily } from "@/lib/fonts/catalog";
import type { CardConfig } from "@/lib/card/schema";

type IdCardProps = {
  config: CardConfig;
};

/** Placeholder card face. The real card styles land in the card renderer step. */
export function IdCard({ config }: IdCardProps) {
  const { brand, member, font } = config;

  return (
    <article
      aria-label={`${brand.name} ID card for ${member.fullName}`}
      className="flex aspect-[1080/1712] w-52 flex-col justify-between rounded-2xl p-6 shadow-2xl ring-1 ring-white/10 md:w-72"
      style={{
        backgroundColor: brand.colors.background,
        color: brand.colors.text,
        fontFamily: cssFontFamily(font),
      }}
    >
      <header className="flex items-center gap-2">
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URLs can't use next/image
          <img
            src={brand.logoUrl}
            alt=""
            className="size-6 rounded-md object-contain"
          />
        ) : (
          <span
            aria-hidden
            className="size-6 rounded-md"
            style={{ backgroundColor: brand.colors.primary }}
          />
        )}
        <span className="font-medium">{brand.name}</span>
        {member.label && (
          <span className="ml-auto text-[10px] tracking-widest uppercase opacity-60">
            {member.label}
          </span>
        )}
      </header>

      <div>
        <p className="text-[10px] tracking-widest uppercase opacity-60">
          {member.membership}
        </p>
        <p className="mt-1 text-2xl font-semibold">{member.fullName}</p>
        <p className="text-xs opacity-70">{member.title}</p>
        <div className="mt-4 flex justify-between font-mono text-[10px] opacity-60">
          <span>{resolveMemberId(brand.name, member)}</span>
          <span>{member.memberSince}</span>
        </div>
      </div>
    </article>
  );
}
