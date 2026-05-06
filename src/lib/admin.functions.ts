import { createServerFn } from "@tanstack/react-start";
import { checkAdminPassword, createMenuPin, deleteMenuPin, updateMenuPin } from "@/server/admin.server";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    checkAdminPassword(data.password);
    return { ok: true };
  });

export const adminCreatePin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; page: number; x: number; y: number }) => d)
  .handler(async ({ data }) => {
    checkAdminPassword(data.password);
    return createMenuPin(data);
  });

export const adminUpdatePin = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      password: string;
      id: string;
      patch: {
        price?: number | null;
        label?: string | null;
        x?: number;
        y?: number;
        page?: number;
      };
    }) => d,
  )
  .handler(async ({ data }) => {
    checkAdminPassword(data.password);
    return updateMenuPin({ id: data.id, patch: data.patch });
  });

export const adminDeletePin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkAdminPassword(data.password);
    return deleteMenuPin(data.id);
  });