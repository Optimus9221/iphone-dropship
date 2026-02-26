"use client";

import { useI18n } from "@/lib/i18n/context";
import type { ProductContent, SpecCategory } from "@/lib/i18n/product-content";
import { motion } from "framer-motion";

type ProductSpecsProps = {
  content: ProductContent;
};

function SpecRow({ label, value }: { label: string; value: string }) {
  const parts = value.split("\n");
  return (
    <tr className="group border-b border-white/5 last:border-b-0">
      <td className="py-3 pr-4 text-sm text-slate-400 group-hover:text-slate-300">
        {label}
      </td>
      <td className="py-3 text-right text-sm text-white">
        {parts.length > 1 ? (
          <span className="block text-right">
            {parts.map((p, i) => (
              <span key={i}>
                {p}
                {i < parts.length - 1 && <br />}
              </span>
            ))}
          </span>
        ) : (
          value
        )}
      </td>
    </tr>
  );
}

function SpecCategoryBlock({ category, index }: { category: SpecCategory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <h3 className="border-b-2 border-emerald-500/30 pb-2 text-base font-semibold text-white">
        {category.title}
      </h3>
      <table className="mt-1 w-full">
        <tbody>
          {category.items.map((item) => (
            <SpecRow key={item.key} label={item.key} value={item.value} />
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

export function ProductSpecs({ content }: ProductSpecsProps) {
  const { t } = useI18n();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{t("productSpecsTitle")}</h2>
      </div>
      <div className="divide-y divide-white/10 px-6 py-4">
        {content.specs.map((category, index) => (
          <div key={category.title} className="py-5">
            <SpecCategoryBlock category={category} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
