import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const TimeSheetItemSchema = z.object({
  numeroAddvalora: z.string(),
  segurado: z.string(),
  regulador: z.string(),
  tempoMinutos: z.number(),
  valor: z.number(),
  dataTimeSheet: z.string(), // ISO date string
  operacao: z.string(),
  diretoria: z.string(),
  equipe: z.string(),
  coordenador: z.string(),
});

const TimeSheetResumoSchema = z.object({
  operacao: z.string(),
  quantidadeTimeSheets: z.number(),
  valorTotal: z.number(),
});

const SaveTimeSheetSchema = z.object({
  filename: z.string(),
  fileSize: z.number(),
  totalItems: z.number(),
  totalValor: z.number(),
  items: z.array(TimeSheetItemSchema),
  resumos: z.array(TimeSheetResumoSchema),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = SaveTimeSheetSchema.parse(body);

    // Criar time sheet com items e resumos
    const timeSheet = await prisma.timeSheet.create({
      data: {
        filename: data.filename,
        fileSize: data.fileSize,
        totalItems: data.totalItems,
        totalValor: data.totalValor,
        items: {
          create: data.items.map((item) => ({
            numeroAddvalora: item.numeroAddvalora,
            segurado: item.segurado,
            regulador: item.regulador,
            tempoMinutos: item.tempoMinutos,
            valor: item.valor,
            dataTimeSheet: new Date(item.dataTimeSheet),
            operacao: item.operacao,
            diretoria: item.diretoria,
            equipe: item.equipe,
            coordenador: item.coordenador,
          })),
        },
        resumos: {
          create: data.resumos.map((resumo) => ({
            operacao: resumo.operacao,
            quantidade: resumo.quantidadeTimeSheets,
            valorTotal: resumo.valorTotal,
          })),
        },
      },
      include: {
        items: true,
        resumos: true,
      },
    });

    // Registrar log de auditoria
    await prisma.log.create({
      data: {
        action: "import",
        resource: "timesheet",
        resourceId: timeSheet.id,
        details: JSON.stringify({
          filename: data.filename,
          itemsCount: data.totalItems,
          valorTotal: data.totalValor,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: timeSheet,
    });
  } catch (error) {
    console.error("[API Save] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao salvar time sheet",
      },
      { status: 500 }
    );
  }
}

// Listar todos os time sheets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const timeSheets = await prisma.timeSheet.findMany({
      take: limit,
      skip: offset,
      orderBy: { importedAt: "desc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    const total = await prisma.timeSheet.count();

    return NextResponse.json({
      success: true,
      data: timeSheets,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("[API List] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao listar time sheets",
      },
      { status: 500 }
    );
  }
}
