interface Company {
  name: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  fontStyle?: string;
  letterSpacing?: string;
}

const companies: Company[] = [
  { name: "SAMSUNG", fontSize: 18, fontWeight: 700, letterSpacing: "0.12em" },
  { name: "Forbes", fontSize: 22, fontWeight: 700, fontFamily: "Georgia, serif", fontStyle: "italic" },
  { name: "shopify", fontSize: 16, fontWeight: 700 },
  { name: "amazon", fontSize: 18, fontWeight: 400 },
];

const TrustedCompanies: React.FC = () => {
  return (
    <div className="px-8 py-7 bg-[#fafafa] w-[95%] mx-auto mt-8 h-fit">
      <p className="text-center text-gray-500 text-sm font-medium mb-5">
        Trusted Companies
      </p>
      <div className="flex justify-center items-center gap-16">
        {companies.map((company) => (
          <span
            key={company.name}
            className="text-gray-400"
            style={{
              fontSize: company.fontSize ?? 16,
              fontWeight: company.fontWeight ?? 700,
              letterSpacing: company.letterSpacing ?? "0",
              fontFamily: company.fontFamily ?? "inherit",
              fontStyle: company.fontStyle ?? "normal",
            }}
          >
            {company.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TrustedCompanies;