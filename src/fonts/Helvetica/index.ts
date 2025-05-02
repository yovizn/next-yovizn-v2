import local from "next/font/local";

export const helvetica = local({
  src: [
    {
      path: "./HelveticaNeueCyr-Roman.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./HelveticaNeueCyr-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./HelveticaNeueCyr-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica",
  display: "auto",
  style: "normal",
});
