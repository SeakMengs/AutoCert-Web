export const fontMetadata = [
  {
    name: "Alex Brush",
    path: "fonts/AlexBrush-Regular.ttf",
  },
  {
    name: "CaskaydiaCove NF SemiBold",
    path: "fonts/CaskaydiaCoveNerdFont-SemiBold.ttf",
  },
  {
    name: "Great Vibes",
    path: "fonts/GreatVibes-Regular.ttf",
  },
  {
    name: "Khmer OS Siemreap",
    path: "fonts/KhmerOS_siemreap.ttf",
  },
  {
    name: "Calibri",
    path: "fonts/calibri-regular.ttf",
  },
  {
    name: "Microsoft YaHei",
    path: "fonts/chinese.msyh.ttf",
  },
  {
    name: "Times New Roman",
    path: "fonts/times-new-roman.ttf",
  },
] satisfies {
  name: string;
  path: string;
}[];

export const DEFAULT_FONT_INDEX = 0;

export const loadCustomFont = async (fontName: string, fontPath: string) => {
  const font = new FontFace(fontName, `url(/annotate/${fontPath})`);
  await font.load();
  document.fonts.add(font);
};
