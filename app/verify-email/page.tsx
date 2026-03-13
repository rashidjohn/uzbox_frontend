"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useVerifyEmail } from "@/lib/hooks";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const uid   = searchParams.get("uid")   ?? "";
  const token = searchParams.get("token") ?? "";
  const verifyEmail = useVerifyEmail();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setMessage("Token noto'g'ri yoki muddati o'tgan");
      return;
    }
    verifyEmail.mutate({ uid, token }, {
      onSuccess: (data) => { setStatus("success"); setMessage(data.message || "Email tasdiqlandi!"); },
      onError:   ()     => { setStatus("error");   setMessage("Token noto'g'ri yoki muddati o'tgan"); },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, token]);

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        {status === "loading" && (
          <>
            <Loader2 size={48} color="#f97316" style={{ margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 800, color: "#1a1a18" }}>Tekshirilmoqda...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={64} color="#22c55e" style={{ margin: "0 auto 24px" }} />
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>Email tasdiqlandi! ✅</h2>
            <p style={{ color: "#6b6b60", marginBottom: 28 }}>{message}</p>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", padding: "13px 28px", borderRadius: 13, background: "#f97316", color: "white", textDecoration: "none", fontWeight: 700 }}>
              Bosh sahifaga
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={64} color="#ef4444" style={{ margin: "0 auto 24px" }} />
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>Xatolik yuz berdi</h2>
            <p style={{ color: "#6b6b60", marginBottom: 28 }}>{message}</p>
            <Link href="/profile" style={{ display: "inline-flex", padding: "13px 28px", borderRadius: 13, background: "#f97316", color: "white", textDecoration: "none", fontWeight: 700 }}>
              Profilga qaytish
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><VerifyContent /></Suspense>;
}
