import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import crypto from "crypto";

// Middleware untuk validasi secret key
export const validateSecretKey = async (c: Context, next: Next) => {
  const secretKey = process.env.WAKUU_SECRET_KEY;

  // Jika secret key tidak dikonfigurasi, block request di production
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new HTTPException(500, { message: "Server configuration error" });
    }
    console.warn(
      "WAKUU_SECRET_KEY tidak dikonfigurasi. Validasi dilewati (development only)."
    );
    return next();
  }

  try {
    // Cek Authorization header terlebih dahulu
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secretKey))) {
        return next();
      }
    }

    // Jika tidak ada di header, cek form data
    const formData = await c.req.parseBody().catch(() => ({}));
    const requestSecretKey =
      formData && typeof formData === "object" && "wakuu_secret_key" in formData
        ? String(formData.wakuu_secret_key)
        : undefined;

    if (
      requestSecretKey &&
      crypto.timingSafeEqual(
        Buffer.from(requestSecretKey),
        Buffer.from(secretKey)
      )
    ) {
      return next();
    }

    // Log failed attempt (without sensitive data)
    console.warn(
      `Failed authentication attempt from IP: ${
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown"
      }`
    );

    // Jika validasi gagal, kembalikan error 401
    throw new HTTPException(401, {
      message: "Unauthorized: Invalid secret key",
    });
  } catch (error) {
    // Jika error adalah HTTPException, lempar kembali
    if (error instanceof HTTPException) {
      throw error;
    }

    // Untuk error lainnya, log dan lempar error 401
    console.error("Error in validateSecretKey middleware:", error);
    throw new HTTPException(401, {
      message: "Unauthorized: Invalid secret key",
    });
  }
};
