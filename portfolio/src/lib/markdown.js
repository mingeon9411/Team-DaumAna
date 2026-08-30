import matter from "gray-matter";

// Vite 4+: `as: "raw"` is deprecated, use query+import instead.
const modules = import.meta.glob("../content/case-studies/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export function getAllCaseStudies() {
  const items = Object.entries(modules).map(([path, raw]) => {
    const slug = path.split("/").pop().replace(".md", "");
    const { data, content } = matter(raw);

    return {
      slug,
      meta: {
        title: data.title ?? slug,
        date: data.date ?? "",
        period: data.period,
        role: data.role ?? [],
        stack: data.stack ?? [],
        highlights: data.highlights ?? [],
        tags: data.tags ?? [],
        summary: data.summary ?? "",
      },
      content,
    };
  });

  items.sort((a, b) => (b.meta.date ?? "").localeCompare(a.meta.date ?? ""));
  return items;
}

export function getCaseStudyBySlug(slug) {
  return getAllCaseStudies().find((x) => x.slug === slug);
}
