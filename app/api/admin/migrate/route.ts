import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

// API para rodar migrações - protegida por secret
export async function POST(request: NextRequest) {
  try {
    // Verificar secret de admin
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Rodar migrações
    const result = execSync("npx prisma migrate deploy", {
      encoding: "utf-8",
      cwd: process.cwd(),
    });

    return NextResponse.json({
      success: true,
      message: "Migrações executadas com sucesso",
      output: result,
    });
  } catch (error) {
    console.error("[Migrate] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao executar migrações",
      },
      { status: 500 }
    );
  }
}
