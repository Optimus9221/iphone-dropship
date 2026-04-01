import Link from "next/link";

const OPTIMUS_URL = "https://optimus-project.vercel.app/";

export function OptimusProjectFooterLink() {
  return (
    <Link
      href={OPTIMUS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 outline-none transition duration-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/90 focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-950"
      aria-label="Optimus Project — studio website"
    >
      <span className="relative h-9 w-9 shrink-0 transition duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.35)] dark:group-hover:drop-shadow-[0_0_14px_rgba(52,211,153,0.4)]">
        <img
          src="/optimus-mark-light.svg"
          width={36}
          height={36}
          className="h-9 w-9 dark:hidden"
          alt=""
          decoding="async"
        />
        <img
          src="/optimus-mark-dark.svg"
          width={36}
          height={36}
          className="hidden h-9 w-9 dark:block"
          alt=""
          decoding="async"
        />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="text-[0.9375rem] font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Optimus
        </span>
        <span className="mt-0.5 text-xs font-semibold tracking-wide text-emerald-600 dark:text-emerald-400">
          Project
        </span>
      </span>
    </Link>
  );
}
