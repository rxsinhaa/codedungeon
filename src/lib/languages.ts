export type Language = {
  name: string;
  version: string;
  alias: string;
};

export const languages: Language[] = [
  { name: "c++", version: "10.2.0", alias: "cpp" },
];

export const getLanguage = (alias: string) => languages.find(l => l.alias === alias) || languages[0];
