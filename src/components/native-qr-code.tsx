import { useEffect, useState } from "react";
import QRCode from "qrcode";

type NativeQRCodeProps = {
  value: string;
  size?: number;
};

export function NativeQRCode({ value, size = 200 }: NativeQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: size * 2,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size, background: "#fff" }} />;
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt="QR Code"
      style={{ width: size, height: size, display: "block" }}
    />
  );
}
